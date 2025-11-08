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

    const wallpaperId = wallpaper._id;
    const isFavorited = user.favorites?.some(
      (favId) => favId.toString() === wallpaperId.toString()
    );

    if (isFavorited) {
      // Remove from favorites
      await User.findByIdAndUpdate(user._id, {
        $pull: { favorites: wallpaperId },
      });
      await Wallpaper.findByIdAndUpdate(id, {
        $pull: { favorites: user._id },
      });
      return NextResponse.json({ favorited: false });
    } else {
      // Add to favorites
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { favorites: wallpaperId },
      });
      await Wallpaper.findByIdAndUpdate(id, {
        $addToSet: { favorites: user._id },
      });
      return NextResponse.json({ favorited: true });
    }
  } catch (error: any) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

