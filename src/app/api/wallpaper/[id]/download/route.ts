import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";

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
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const wallpaper = await Wallpaper.findById(id);
    if (!wallpaper) {
      return NextResponse.json({ error: "Wallpaper not found" }, { status: 404 });
    }

    // Increment download count
    await Wallpaper.findByIdAndUpdate(id, {
      $inc: { downloads: 1 },
    });

    // Add to download history
    if (!user.downloadHistory) {
      user.downloadHistory = [];
    }
    user.downloadHistory.push({
      wallpaperId: wallpaper._id,
      downloadedAt: new Date(),
    });
    
    // Keep only last 100 downloads
    if (user.downloadHistory.length > 100) {
      user.downloadHistory = user.downloadHistory.slice(-100);
    }
    
    await user.save();

    return NextResponse.json({
      success: true,
      downloadUrl: wallpaper.imageUrl,
    });
  } catch (error: any) {
    console.error("Error recording download:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

