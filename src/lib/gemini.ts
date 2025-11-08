/**
 * Generate an image using Stability AI API
 * Uses Stable Diffusion XL for high-quality image generation
 */
export async function generateImage(
  prompt: string,
  aspectRatio: "16:9" | "9:16" | "21:9" = "16:9"
): Promise<string> {
  try {
    const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
    if (!STABILITY_API_KEY) {
      throw new Error(
        "STABILITY_API_KEY is not set in .env.local. Please add your Stability AI API key."
      );
    }

    // Stability AI SDXL v1.0 only accepts these specific dimensions:
    // 1024x1024, 1152x896, 1216x832, 1344x768, 1536x640, 
    // 640x1536, 768x1344, 832x1216, 896x1152
    
    // Map aspect ratios to closest allowed dimensions
    const dimensions: Record<string, { width: number; height: number }> = {
      "16:9": { width: 1344, height: 768 },  // Closest to 16:9 aspect ratio
      "9:16": { width: 768, height: 1344 },  // Closest to 9:16 aspect ratio (portrait)
      "21:9": { width: 1536, height: 640 },  // Closest to 21:9 aspect ratio (ultrawide)
    };

    const { width, height } = dimensions[aspectRatio];

    // Use Stability AI Stable Diffusion XL API
    const response = await fetch(
      `https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1,
            },
          ],
          cfg_scale: 7,
          height,
          width,
          steps: 30,
          samples: 1,
          style_preset: "enhance",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || `Stability AI API error: ${response.status} ${response.statusText}`;
      console.error("Stability AI API error:", errorMessage, errorData);
      throw new Error(`Failed to generate image: ${errorMessage}`);
    }

    const data = await response.json();

    if (!data.artifacts || data.artifacts.length === 0) {
      throw new Error("No image artifacts returned from Stability AI");
    }

    // Get the first generated image (base64)
    const imageBase64 = data.artifacts[0].base64;
    
    if (!imageBase64) {
      throw new Error("No base64 image data returned from Stability AI");
    }

    // Return as data URL that Cloudinary can handle
    return `data:image/png;base64,${imageBase64}`;
  } catch (error: any) {
    console.error("Error generating image with Stability AI:", error);
    
    // Provide helpful error messages
    if (error.message?.includes("STABILITY_API_KEY")) {
      throw new Error(
        "Stability AI API key is missing. Please add STABILITY_API_KEY to your .env.local file."
      );
    }
    
    if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
      throw new Error(
        "Invalid Stability AI API key. Please check your STABILITY_API_KEY in .env.local."
      );
    }
    
    if (error.message?.includes("402") || error.message?.includes("Payment")) {
      throw new Error(
        "Stability AI API credits exhausted. Please check your account balance or upgrade your plan."
      );
    }
    
    throw error;
  }
}

/**
 * Keep the prompt enhancement functions using Gemini
 * (These are separate from image generation)
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set - prompt enhancement will fail");
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function enhancePrompt(
  prompt: string,
  mood?: string,
  style?: string
): Promise<string> {
  if (!genAI) {
    console.warn("Gemini API not configured, returning original prompt");
    return prompt;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const enhancementPrompt = `You are a creative AI assistant that enhances wallpaper generation prompts. 
Enhance the following user prompt to create a detailed, vivid description for an AI image generator.
Make it descriptive, artistic, and visually appealing while maintaining the user's intent.

User prompt: "${prompt}"
${mood ? `Mood: ${mood}` : ""}
${style ? `Style: ${style}` : ""}

Return ONLY the enhanced prompt, nothing else. Make it 2-3 sentences maximum, rich in visual details.`;

  try {
    const result = await model.generateContent(enhancementPrompt);
    const response = await result.response;
    const enhanced = response.text().trim();

    return enhanced || prompt;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return prompt;
  }
}

export async function rewritePrompt(
  originalPrompt: string,
  instruction: string
): Promise<string> {
  if (!genAI) {
    console.warn("Gemini API not configured, returning original prompt");
    return originalPrompt;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const rewritePrompt = `You are a creative AI assistant. Rewrite the following wallpaper prompt based on the user's instruction.

Original prompt: "${originalPrompt}"
User instruction: "${instruction}"

Return ONLY the rewritten prompt, nothing else. Make it 2-3 sentences maximum, rich in visual details.`;

  try {
    const result = await model.generateContent(rewritePrompt);
    const response = await result.response;
    const rewritten = response.text().trim();

    return rewritten || originalPrompt;
  } catch (error) {
    console.error("Error rewriting prompt:", error);
    return originalPrompt;
  }
}

