import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";

export async function PATCH(
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
    const body = await request.json();
    const { filters } = body;

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const wallpaper = await Wallpaper.findById(id);
    if (!wallpaper || wallpaper.userId?.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Wallpaper not found" },
        { status: 404 }
      );
    }

    // Update filters
    wallpaper.filters = {
      brightness: filters.brightness ?? wallpaper.filters?.brightness ?? 0,
      contrast: filters.contrast ?? wallpaper.filters?.contrast ?? 0,
      saturation: filters.saturation ?? wallpaper.filters?.saturation ?? 0,
      blur: filters.blur ?? wallpaper.filters?.blur ?? 0,
      sharpness: filters.sharpness ?? wallpaper.filters?.sharpness ?? 0,
      warmth: filters.warmth ?? wallpaper.filters?.warmth ?? 0,
    };

    await wallpaper.save();

    return NextResponse.json({
      success: true,
      filters: wallpaper.filters,
    });
  } catch (error: any) {
    console.error("Error updating filters:", error);
    return NextResponse.json(
      { error: "Failed to update filters", message: error.message },
      { status: 500 }
    );
  }
}

