import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongo";
import User from "@/models/User";
import Wallpaper from "@/models/Wallpaper";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const history = user.downloadHistory || [];
    
    // Fetch wallpaper details
    const wallpaperIds = history.map((h) => h.wallpaperId);
    const wallpapers = await Wallpaper.find({
      _id: { $in: wallpaperIds },
    }).lean();

    const historyWithDetails = history.map((h) => {
      const wallpaper = wallpapers.find(
        (w) => w._id.toString() === h.wallpaperId.toString()
      );
      return {
        wallpaperId: h.wallpaperId.toString(),
        downloadedAt: h.downloadedAt,
        wallpaper: wallpaper
          ? {
              id: wallpaper._id.toString(),
              title: wallpaper.title || wallpaper.prompt,
              imageUrl: wallpaper.imageUrl,
              prompt: wallpaper.prompt,
            }
          : null,
      };
    });

    return NextResponse.json({
      history: historyWithDetails.sort(
        (a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
      ),
    });
  } catch (error: any) {
    console.error("Error fetching download history:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

