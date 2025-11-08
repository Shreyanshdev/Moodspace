import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveWallpaperSchema } from "@/utils/validation";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
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
    const validationResult = saveWallpaperSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { wallpaperId } = validationResult.data;

    await connectDB();

    // Find wallpaper
    const wallpaper = await Wallpaper.findById(wallpaperId);
    if (!wallpaper) {
      return NextResponse.json(
        { error: "Wallpaper not found" },
        { status: 404 }
      );
    }

    // Find user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already saved
    if (user.wallpapers.includes(wallpaper._id)) {
      return NextResponse.json({
        success: true,
        message: "Wallpaper already saved",
      });
    }

    // Add to user's wallpapers
    await User.findByIdAndUpdate(user._id, {
      $push: { wallpapers: wallpaper._id },
    });

    // Update wallpaper userId if not set
    if (!wallpaper.userId) {
      await Wallpaper.findByIdAndUpdate(wallpaper._id, {
        userId: user._id,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Wallpaper saved successfully",
    });
  } catch (error: any) {
    console.error("Error saving wallpaper:", error);
    return NextResponse.json(
      { error: "Failed to save wallpaper", message: error.message },
      { status: 500 }
    );
  }
}

