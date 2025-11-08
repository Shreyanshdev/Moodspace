import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const wallpapers = await Wallpaper.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Wallpaper.countDocuments({ isPublic: true });

    return NextResponse.json({
      wallpapers: wallpapers.map((w) => ({
        id: w._id.toString(),
        title: w.title || w.prompt,
        imageUrl: w.imageUrl,
        prompt: w.prompt,
        aspect: w.aspect,
        createdAt: w.createdAt?.toISOString() || "",
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
