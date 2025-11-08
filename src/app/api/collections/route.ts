import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongo";
import User from "@/models/User";

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

    return NextResponse.json({
      collections: user.collections || [],
    });
  } catch (error: any) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Collection name is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create new collection
    if (!user.collections) {
      user.collections = [];
    }
    
    const newCollection = {
      name: name.trim(),
      description: description?.trim() || "",
      wallpapers: [],
      createdAt: new Date(),
    };
    
    user.collections.push(newCollection);
    await user.save();

    return NextResponse.json({
      success: true,
      collection: newCollection,
    });
  } catch (error: any) {
    console.error("Error creating collection:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

