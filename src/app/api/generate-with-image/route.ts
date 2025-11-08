import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { uploadToCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";
import { generateImageFromPrompt } from "@/lib/imageGeneration";
import { enhancePrompt } from "@/utils/promptEnhancer";
import { checkUserCredits, deductCredit } from "@/utils/creditManager";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 5,
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

    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt, referenceImageUrl, aspect, mood, style, quality = "standard" } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check credits
    const creditCheck = await checkUserCredits(user.userId);
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: "Insufficient credits. Please upgrade your plan." },
        { status: 402 }
      );
    }

    // Enhance prompt
    const enhancedPrompt = await enhancePrompt(prompt, mood, style);

    // Generate image with reference if provided
    let imageUrl: string;
    try {
      imageUrl = await generateImageFromPrompt({
        prompt: enhancedPrompt,
        aspectRatio: aspect || "16:9",
        referenceImageUrl,
        quality: quality as "standard" | "premium" | "ultra",
        style,
        mood,
      });
    } catch (error: any) {
      console.error("Error generating image:", error);
      return NextResponse.json(
        { error: "Failed to generate image", message: error.message },
        { status: 500 }
      );
    }

    // Upload to Cloudinary
    const timestamp = Date.now();
    const uploadResult = await uploadToCloudinary(imageUrl, user.userId, timestamp);

    // Save to database
    const wallpaper = await Wallpaper.create({
      userId: user._id,
      prompt,
      enhancedPrompt,
      referenceImageUrl,
      mood,
      style,
      aspect: aspect || "16:9",
      imageUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      edited: false,
      quality: quality as "standard" | "premium" | "ultra",
    });

    // Deduct credit
    await deductCredit(user.userId);

    // Update user's wallpapers array
    await User.findOneAndUpdate(
      { userId: user.userId },
      { $push: { wallpapers: wallpaper._id } }
    );

    return NextResponse.json({
      success: true,
      wallpaper: {
        id: wallpaper._id.toString(),
        imageUrl: uploadResult.secure_url,
        prompt: enhancedPrompt,
        aspect: aspect || "16:9",
      },
      credits: creditCheck.credits - 1,
    });
  } catch (error: any) {
    console.error("Error generating wallpaper with image:", error);
    return NextResponse.json(
      { error: "Failed to generate wallpaper", message: error.message },
      { status: 500 }
    );
  }
}

