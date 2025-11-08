import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { wallpaperId, imageData } = body;

    if (!wallpaperId || !imageData) {
      return NextResponse.json(
        { error: "Missing wallpaperId or imageData" },
        { status: 400 }
      );
    }

    await connectDB();
    const wallpaper = await Wallpaper.findById(wallpaperId);
    
    if (!wallpaper) {
      return NextResponse.json(
        { error: "Wallpaper not found" },
        { status: 404 }
      );
    }

    // Upload edited image (imageData is base64 data URL)
    const timestamp = Date.now();
    const uploadResult = await uploadToCloudinary(
      imageData,
      session.user.userId,
      timestamp
    );

    // Update wallpaper
    await Wallpaper.findByIdAndUpdate(wallpaperId, {
      imageUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      edited: true,
    });

    return NextResponse.json({
      success: true,
      wallpaper: {
        id: wallpaperId,
        imageUrl: uploadResult.secure_url,
      },
    });
  } catch (error: any) {
    console.error("Error saving edited wallpaper:", error);
    return NextResponse.json(
      { error: "Failed to save wallpaper", message: error.message },
      { status: 500 }
    );
  }
}
