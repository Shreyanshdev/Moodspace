/**
 * Advanced image generation with reference image support
 * Uses Stability AI for world-class quality generation
 */

export interface GenerateImageOptions {
  prompt: string;
  aspectRatio: "16:9" | "9:16" | "21:9";
  referenceImageUrl?: string;
  quality?: "standard" | "premium" | "ultra";
  style?: string;
  mood?: string;
}

/**
 * Generate image from text prompt with optional reference image
 */
export async function generateImageFromPrompt(
  options: GenerateImageOptions
): Promise<string> {
  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
  if (!STABILITY_API_KEY) {
    throw new Error("STABILITY_API_KEY is not set");
  }

  const { prompt, aspectRatio, referenceImageUrl, quality = "standard", style, mood } = options;

  // Map aspect ratios to dimensions
  const dimensions: Record<string, { width: number; height: number }> = {
    "16:9": { width: 1344, height: 768 },
    "9:16": { width: 768, height: 1344 },
    "21:9": { width: 1536, height: 640 },
  };

  const { width, height } = dimensions[aspectRatio];

  // Quality settings
  const qualitySettings = {
    standard: { steps: 30, cfg_scale: 7 },
    premium: { steps: 50, cfg_scale: 8 },
    ultra: { steps: 80, cfg_scale: 9 },
  };

  const { steps, cfg_scale } = qualitySettings[quality];

  // If reference image provided, use image-to-image
  if (referenceImageUrl) {
    return generateFromReferenceImage({
      prompt,
      referenceImageUrl,
      width,
      height,
      steps,
      cfg_scale,
      style,
      mood,
    });
  }

  // Otherwise, use text-to-image
  return generateFromText({
    prompt,
    width,
    height,
    steps,
    cfg_scale,
    style,
    mood,
  });
}

/**
 * Generate image from reference image (image-to-image)
 */
async function generateFromReferenceImage({
  prompt,
  referenceImageUrl,
  width,
  height,
  steps,
  cfg_scale,
  style,
  mood,
}: {
  prompt: string;
  referenceImageUrl: string;
  width: number;
  height: number;
  steps: number;
  cfg_scale: number;
  style?: string;
  mood?: string;
}): Promise<string> {
  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
  if (!STABILITY_API_KEY) {
    throw new Error("STABILITY_API_KEY is not set");
  }

  // Fetch reference image
  const imageResponse = await fetch(referenceImageUrl);
  if (!imageResponse.ok) {
    throw new Error("Failed to fetch reference image");
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const imageBlob = new Blob([imageBuffer], { type: "image/png" });

  // Enhance prompt with style and mood
  let enhancedPrompt = prompt;
  if (style) enhancedPrompt += `, ${style} style`;
  if (mood) enhancedPrompt += `, ${mood} mood`;

  const formData = new FormData();
  formData.append("init_image", imageBlob, "reference.png");
  formData.append("text_prompts[0][text]", enhancedPrompt);
  formData.append("text_prompts[0][weight]", "1.0");
  formData.append("image_strength", "0.4"); // Balance between reference and prompt
  formData.append("cfg_scale", cfg_scale.toString());
  formData.append("steps", steps.toString());
  formData.append("samples", "1");
  formData.append("style_preset", "enhance");

  const response = await fetch(
    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${STABILITY_API_KEY}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Stability AI API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  if (!data.artifacts || data.artifacts.length === 0) {
    throw new Error("No image artifacts returned");
  }

  return `data:image/png;base64,${data.artifacts[0].base64}`;
}

/**
 * Generate image from text prompt (text-to-image)
 */
async function generateFromText({
  prompt,
  width,
  height,
  steps,
  cfg_scale,
  style,
  mood,
}: {
  prompt: string;
  width: number;
  height: number;
  steps: number;
  cfg_scale: number;
  style?: string;
  mood?: string;
}): Promise<string> {
  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
  if (!STABILITY_API_KEY) {
    throw new Error("STABILITY_API_KEY is not set");
  }

  // Enhance prompt
  let enhancedPrompt = prompt;
  if (style) enhancedPrompt += `, ${style} style`;
  if (mood) enhancedPrompt += `, ${mood} mood`;

  const response = await fetch(
    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
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
            text: enhancedPrompt,
            weight: 1,
          },
        ],
        cfg_scale,
        height,
        width,
        steps,
        samples: 1,
        style_preset: "enhance",
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Stability AI API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  if (!data.artifacts || data.artifacts.length === 0) {
    throw new Error("No image artifacts returned");
  }

  return `data:image/png;base64,${data.artifacts[0].base64}`;
}

