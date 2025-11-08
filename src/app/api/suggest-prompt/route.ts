import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: "Gemini API not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || prompt.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const suggestionPrompt = `You are a creative AI assistant that suggests wallpaper prompts.
Based on the user's partial input, suggest 3-5 complete, detailed wallpaper prompts that they might want to use.
Make suggestions creative, visually descriptive, and suitable for AI image generation.

User's partial input: "${prompt}"

Return ONLY a JSON array of suggested prompts, nothing else. Format: ["suggestion1", "suggestion2", "suggestion3"]
Each suggestion should be 1-2 sentences, descriptive and visually rich.`;

    try {
      const result = await model.generateContent(suggestionPrompt);
      const response = await result.response;
      const text = response.text().trim();

      // Try to parse JSON from response
      let suggestions: string[] = [];
      try {
        // Extract JSON array from response
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: split by lines and clean up
          suggestions = text
            .split("\n")
            .map((line) => line.replace(/^[-•\d.]+\s*/, "").trim())
            .filter((line) => line.length > 0 && line.length < 200)
            .slice(0, 5);
        }
      } catch {
        // If parsing fails, return empty array
        suggestions = [];
      }

      return NextResponse.json({ suggestions });
    } catch (error: any) {
      console.error("Error generating suggestions:", error);
      return NextResponse.json({ suggestions: [] });
    }
  } catch (error: any) {
    console.error("Error in suggest-prompt route:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
