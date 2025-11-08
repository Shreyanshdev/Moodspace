import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";
import { Types } from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    
    // Get the public wallpaper
    const publicWallpaper = await Wallpaper.findById(id);
    if (!publicWallpaper || !publicWallpaper.isPublic) {
      return NextResponse.json({ error: "Wallpaper not found or not public" }, { status: 404 });
    }

    // Check if user already has this wallpaper
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert string id to ObjectId
    const wallpaperObjectId = new Types.ObjectId(id);
    
    // Check if wallpaper is already in user's collection
    if (user.wallpapers.some((wId) => wId.toString() === id)) {
      return NextResponse.json({ 
        success: true, 
        message: "Wallpaper already in your collection" 
      });
    }

    // Create a copy for the user (or just add reference)
    // Option 1: Add reference to existing wallpaper
    user.wallpapers.push(wallpaperObjectId);
    await user.save();

    // Option 2: Create a new wallpaper copy (uncomment if you want separate copies)
    // const newWallpaper = new Wallpaper({
    //   userId: user._id,
    //   prompt: publicWallpaper.prompt,
    //   enhancedPrompt: publicWallpaper.enhancedPrompt,
    //   title: publicWallpaper.title,
    //   aspect: publicWallpaper.aspect,
    //   imageUrl: publicWallpaper.imageUrl,
    //   cloudinaryPublicId: publicWallpaper.cloudinaryPublicId,
    //   isPublic: false, // Personal copy is not public
    // });
    // await newWallpaper.save();
    // user.wallpapers.push(newWallpaper._id);
    // await user.save();

    return NextResponse.json({ 
      success: true, 
      message: "Wallpaper saved to your personal gallery" 
    });
  } catch (error: any) {
    console.error("Error saving wallpaper:", error);
    return NextResponse.json(
      { error: "Failed to save wallpaper", message: error.message },
      { status: 500 }
    );
  }
}
