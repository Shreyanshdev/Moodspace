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

    const userId = user._id;
    const isLiked = wallpaper.likes?.some((likeId) => likeId.toString() === userId.toString());

    if (isLiked) {
      // Unlike
      await Wallpaper.findByIdAndUpdate(id, {
        $pull: { likes: userId },
      });
      return NextResponse.json({ liked: false, likes: (wallpaper.likes?.length || 1) - 1 });
    } else {
      // Like
      await Wallpaper.findByIdAndUpdate(id, {
        $addToSet: { likes: userId },
      });
      return NextResponse.json({ liked: true, likes: (wallpaper.likes?.length || 0) + 1 });
    }
  } catch (error: any) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

