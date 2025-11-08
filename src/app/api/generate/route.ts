import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateWallpaperSchema } from "@/utils/validation";
import { enhancePrompt } from "@/utils/promptEnhancer";
import { checkGuestLimit, incrementGuestGeneration, checkUserCredits, deductCredit } from "@/utils/creditManager";
import { rateLimit } from "@/lib/rate-limit";
import { uploadToCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";
import { generateImage } from "@/lib/gemini";

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 5, // 5 requests per minute
});

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

    // Validate input
    const body = await request.json();
    const validationResult = generateWallpaperSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { prompt, mood, style, aspect } = validationResult.data;

    // Check authentication and credits
    const session = await auth();
    let userId: string | undefined;
    let credits: number = 0;

    if (session?.user) {
      // Logged in user
      await connectDB();
      const user = await User.findOne({ email: session.user.email });
      
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      const creditCheck = await checkUserCredits(user.userId);
      if (!creditCheck.allowed) {
        return NextResponse.json(
          { error: "Insufficient credits. Please upgrade your plan." },
          { status: 402 }
        );
      }

      userId = user.userId;
      credits = creditCheck.credits;
    } else {
      // Guest user
      const guestCheck = await checkGuestLimit();
      if (!guestCheck.allowed) {
        return NextResponse.json(
          { error: "Guest limit reached. Please sign in to continue." },
          { status: 401 }
        );
      }
    }

    // Enhance prompt
    const enhancedPrompt = await enhancePrompt(prompt, mood, style);

    // Generate image
    // Note: This may need to be adjusted based on actual Gemini API capabilities
    // If Gemini doesn't support image generation, use an alternative service
    let imageUrl: string;
    
    try {
      imageUrl = await generateImage(enhancedPrompt, aspect);
    } catch (error: any) {
      // If image generation fails, return error with instructions
      if (error.message?.includes("needs to be configured")) {
        return NextResponse.json(
          {
            error: "Image generation service not configured",
            message: "Please configure an image generation service (Gemini, Stability AI, DALL-E, etc.)",
          },
          { status: 503 }
        );
      }
      throw error;
    }

    // Upload to Cloudinary
    const timestamp = Date.now();
    const uploadResult = await uploadToCloudinary(imageUrl, userId, timestamp);

    // Save to database
    await connectDB();
    const wallpaper = await Wallpaper.create({
      userId: userId ? await User.findOne({ userId }).then(u => u?._id) : undefined,
      prompt,
      enhancedPrompt,
      mood,
      style,
      aspect,
      imageUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      edited: false,
    });

    // Deduct credit
    if (session?.user && userId) {
      await deductCredit(userId);
    } else {
      await incrementGuestGeneration();
    }

    // Update user's wallpapers array if logged in
    if (session?.user && userId) {
      await User.findOneAndUpdate(
        { userId },
        { $push: { wallpapers: wallpaper._id } }
      );
    }

    return NextResponse.json({
      success: true,
      wallpaper: {
        id: wallpaper._id.toString(),
        imageUrl: uploadResult.secure_url,
        prompt: enhancedPrompt,
        aspect,
      },
      credits: session?.user ? credits - 1 : undefined,
    });
  } catch (error: any) {
    console.error("Error generating wallpaper:", error);
    
    // Handle Cloudinary timeout specifically
    if (error.message?.includes("timeout") || error.message?.includes("Timeout")) {
      return NextResponse.json(
        { 
          error: "Upload timeout", 
          message: "The image upload is taking too long. Please try again or use a smaller image size." 
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate wallpaper", message: error.message },
      { status: 500 }
    );
  }
}

