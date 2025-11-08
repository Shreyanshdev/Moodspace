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
    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const wallpaper = await Wallpaper.findById(id);
    if (!wallpaper || !wallpaper.isPublic) {
      return NextResponse.json({ error: "Wallpaper not found or not public" }, { status: 404 });
    }

    // Add comment
    if (!wallpaper.comments) {
      wallpaper.comments = [];
    }
    wallpaper.comments.push({
      userId: user._id,
      text: text.trim(),
      createdAt: new Date(),
    });
    await wallpaper.save();

    return NextResponse.json({
      success: true,
      comment: {
        userId: user._id.toString(),
        userName: user.name,
        userImage: user.image,
        text: text.trim(),
        createdAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

