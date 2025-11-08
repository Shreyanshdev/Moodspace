import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const wallpaper = await Wallpaper.findById(id);
    if (!wallpaper) {
      return NextResponse.json(
        { error: "Wallpaper not found" },
        { status: 404 }
      );
    }

    // Check if user owns this wallpaper
    if (wallpaper.userId?.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Unauthorized: You can only delete your own wallpapers" },
        { status: 403 }
      );
    }

    // Remove wallpaper from user's wallpapers array
    user.wallpapers = user.wallpapers.filter(
      (wId) => wId.toString() !== id
    );
    await user.save();

    // Delete the wallpaper document
    await Wallpaper.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Wallpaper deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting wallpaper:", error);
    return NextResponse.json(
      { error: "Failed to delete wallpaper", message: error.message },
      { status: 500 }
    );
  }
}

