/**
 * AI Quote Generator - Generates beautiful quotes based on image vibes
 * Uses Gemini AI to analyze image and generate contextual quotes
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export interface QuoteOptions {
  imageUrl?: string;
  prompt?: string;
  mood?: string;
  style?: string;
  userInput?: string;
  quoteType?: "inspirational" | "motivational" | "philosophical" | "poetic" | "custom";
}

export interface GeneratedQuote {
  text: string;
  author?: string;
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    opacity: number;
    fontWeight: string;
    fontStyle: string;
  };
  position: {
    x: number;
    y: number;
  };
}

/**
 * Generate a beautiful quote based on image vibes and user input
 */
export async function generateQuote(options: QuoteOptions): Promise<GeneratedQuote> {
  if (!genAI) {
    throw new Error("Gemini API not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Build context for quote generation
  let context = "";
  if (options.userInput) {
    context = `User wants: "${options.userInput}"`;
  } else if (options.prompt) {
    context = `Image description: "${options.prompt}"`;
  }
  if (options.mood) context += `\nMood: ${options.mood}`;
  if (options.style) context += `\nStyle: ${options.style}`;
  if (options.quoteType) context += `\nQuote type: ${options.quoteType}`;

  const quotePrompt = `You are a creative AI assistant that generates beautiful, meaningful quotes.

${context}

Generate a beautiful, inspiring quote that matches the vibe and aesthetic of the image. The quote should be:
- 1-2 sentences maximum
- Meaningful and impactful
- Visually appealing when overlaid on an image
- Match the mood and style described

Return ONLY a JSON object with this exact format:
{
  "text": "the quote text here",
  "author": "author name or leave empty string",
  "style": {
    "fontFamily": "serif or sans-serif",
    "fontSize": 48,
    "color": "#FFFFFF",
    "opacity": 0.9,
    "fontWeight": "bold",
    "fontStyle": "normal"
  }
}

Make the quote beautiful and inspiring.`;

  try {
    const result = await model.generateContent(quotePrompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse JSON from response
    let quoteData: any;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quoteData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create quote from text
        quoteData = {
          text: text.replace(/["']/g, "").trim(),
          author: "",
          style: {
            fontFamily: "serif",
            fontSize: 48,
            color: "#FFFFFF",
            opacity: 0.9,
            fontWeight: "bold",
            fontStyle: "normal",
          },
        };
      }
    } catch (parseError) {
      // Fallback quote
      quoteData = {
        text: text || "Be the change you wish to see in the world",
        author: "",
        style: {
          fontFamily: "serif",
          fontSize: 48,
          color: "#FFFFFF",
          opacity: 0.9,
          fontWeight: "bold",
          fontStyle: "normal",
        },
      };
    }

    // Calculate optimal position (center, but slightly above center for visual balance)
    const position = {
      x: 50, // Percentage
      y: 40, // Percentage
    };

    return {
      text: quoteData.text,
      author: quoteData.author || "",
      style: {
        fontFamily: quoteData.style?.fontFamily || "serif",
        fontSize: quoteData.style?.fontSize || 48,
        color: quoteData.style?.color || "#FFFFFF",
        opacity: quoteData.style?.opacity || 0.9,
        fontWeight: quoteData.style?.fontWeight || "bold",
        fontStyle: quoteData.style?.fontStyle || "normal",
      },
      position,
    };
  } catch (error) {
    console.error("Error generating quote:", error);
    // Return default quote
    return {
      text: "Be the change you wish to see in the world",
      author: "Mahatma Gandhi",
      style: {
        fontFamily: "serif",
        fontSize: 48,
        color: "#FFFFFF",
        opacity: 0.9,
        fontWeight: "bold",
        fontStyle: "normal",
      },
      position: { x: 50, y: 40 },
    };
  }
}

/**
 * Insert quote beautifully into image using canvas
 */
export async function insertQuoteIntoImage(
  imageUrl: string,
  quote: GeneratedQuote
): Promise<string> {
  // This will be handled on the client side with canvas
  // Return the quote data to be applied
  return imageUrl; // Placeholder - actual implementation in EditorCanvas
}

