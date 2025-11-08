import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const mood = searchParams.get("mood") || "";
    const style = searchParams.get("style") || "";
    const tags = searchParams.get("tags")?.split(",") || [];
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build search filter
    const filter: any = { isPublic: true };

    if (query) {
      filter.$or = [
        { prompt: { $regex: query, $options: "i" } },
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (mood) {
      filter.mood = mood;
    }

    if (style) {
      filter.style = style;
    }

    if (tags.length > 0) {
      filter.tags = { $in: tags };
    }

    // Build sort
    let sort: any = { createdAt: -1 };
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "popular":
        sort = { likes: -1, views: -1 };
        break;
      case "mostLiked":
        sort = { likes: -1 };
        break;
      case "mostViewed":
        sort = { views: -1 };
        break;
      case "mostDownloaded":
        sort = { downloads: -1 };
        break;
    }

    const wallpapers = await Wallpaper.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Wallpaper.countDocuments(filter);

    return NextResponse.json({
      wallpapers: wallpapers.map((w) => ({
        id: w._id.toString(),
        title: w.title || w.prompt,
        imageUrl: w.imageUrl,
        prompt: w.prompt,
        aspect: w.aspect,
        category: w.category,
        mood: w.mood,
        style: w.style,
        tags: w.tags || [],
        likes: w.likes?.length || 0,
        views: w.views || 0,
        downloads: w.downloads || 0,
        createdAt: w.createdAt?.toISOString() || "",
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error searching gallery:", error);
    return NextResponse.json(
      { error: "Failed to search gallery", message: error.message },
      { status: 500 }
    );
  }
}

