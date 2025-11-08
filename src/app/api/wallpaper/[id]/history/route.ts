import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";

export async function GET(
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
    
    // ✅ Get user first to get their _id
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const wallpaper = await Wallpaper.findById(id);
    if (!wallpaper || wallpaper.userId?.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ history: wallpaper.history || [] });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
