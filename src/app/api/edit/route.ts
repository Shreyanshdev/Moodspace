import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { editWallpaperSchema } from "@/utils/validation";
import { rewritePrompt } from "@/utils/promptEnhancer";
import { rateLimit } from "@/lib/rate-limit";
import { uploadToCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";
import { GoogleGenerativeAI } from "@google/generative-ai";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 5,
});

// ✅ Enhanced function to analyze and improve instruction with Gemini
async function analyzeAndImproveInstruction(
  originalPrompt: string,
  userInstruction: string
): Promise<string> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return `${originalPrompt}, ${userInstruction}`;
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const analysisPrompt = `You are an expert AI assistant that analyzes and improves image editing instructions for AI image generators.

Original wallpaper prompt: "${originalPrompt}"
User's editing instruction: "${userInstruction}"

Create a detailed, realistic prompt for image-to-image editing that:
1. Preserves the original image's core composition and style
2. Clearly describes ONLY the specific changes requested
3. Uses precise editing terminology (e.g., "adjust colors to", "add", "remove", "change lighting to", "apply filter")
4. Maintains realism and coherence
5. Is optimized for Stable Diffusion image-to-image with low image_strength (0.3-0.4)

Return ONLY the improved prompt (1-2 sentences). Focus on the specific changes, not recreating the entire image.`;

  try {
    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const improvedPrompt = response.text().trim();
    return improvedPrompt || `${originalPrompt}, ${userInstruction}`;
  } catch (error) {
    console.error("Error analyzing instruction with Gemini:", error);
    return `${originalPrompt}, ${userInstruction}`;
  }
}

// ✅ Fixed function for image-to-image editing
async function editImageWithAI(
  imageUrl: string,
  improvedPrompt: string
): Promise<string> {
  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
  if (!STABILITY_API_KEY) {
    throw new Error("STABILITY_API_KEY is not set");
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error("Failed to fetch original image");
  }
  const imageBuffer = await imageResponse.arrayBuffer();
  const imageBlob = new Blob([imageBuffer], { type: "image/png" });

  const formData = new FormData();
  formData.append("init_image", imageBlob, "image.png");
  formData.append("text_prompts[0][text]", improvedPrompt);
  formData.append("text_prompts[0][weight]", "1.0");
  
  // ✅ Adjusted parameters for better results
  formData.append("image_strength", "0.3"); // Lower = more preservation
  formData.append("cfg_scale", "7");
  formData.append("steps", "40"); // More steps for better quality
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

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = limiter.check(ip);
    
    if (rateLimitResult.remaining === 0) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate input
    const body = await request.json();
    const validationResult = editWallpaperSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { prompt, instruction, wallpaperId } = validationResult.data;

    // ✅ Get original wallpaper by ID
    await connectDB();
    const originalWallpaper = await Wallpaper.findById(wallpaperId);
    
    if (!originalWallpaper) {
      return NextResponse.json(
        { error: "Wallpaper not found" },
        { status: 404 }
      );
    }

    // ✅ Save previous version to history
    const history = originalWallpaper.history || [];
    history.push({
      imageUrl: originalWallpaper.imageUrl,
      prompt: originalWallpaper.prompt,
      timestamp: new Date(),
    });
    
    // Keep only last 10 versions
    if (history.length > 10) {
      history.shift();
    }

    // ✅ Step 1: Analyze and improve instruction
    const improvedPrompt = await analyzeAndImproveInstruction(prompt, instruction);

    // ✅ Step 2: Use improved prompt with Stability AI
    let imageUrl: string;
    try {
      imageUrl = await editImageWithAI(originalWallpaper.imageUrl, improvedPrompt);
    } catch (error: any) {
      if (error.message?.includes("STABILITY_API_KEY")) {
        return NextResponse.json(
          {
            error: "Image editing service not configured",
            message: "Please configure Stability AI API key",
          },
          { status: 503 }
        );
      }
      throw error;
    }

    const timestamp = Date.now();
    const uploadResult = await uploadToCloudinary(
      imageUrl,
      session.user.userId,
      timestamp
    );

    // ✅ Update wallpaper with history
    await Wallpaper.findByIdAndUpdate(wallpaperId, {
      imageUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      prompt: improvedPrompt,
      edited: true,
      history: history,
    });

    return NextResponse.json({
      success: true,
      wallpaper: {
        id: wallpaperId,
        imageUrl: uploadResult.secure_url,
        prompt: improvedPrompt,
      },
    });
  } catch (error: any) {
    console.error("Error editing wallpaper:", error);
    return NextResponse.json(
      { error: "Failed to edit wallpaper", message: error.message },
      { status: 500 }
    );
  }
}

