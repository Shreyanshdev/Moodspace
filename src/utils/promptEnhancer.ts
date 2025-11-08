import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function enhancePrompt(
  prompt: string,
  mood?: string,
  style?: string
): Promise<string> {
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

