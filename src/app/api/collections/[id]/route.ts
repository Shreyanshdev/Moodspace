import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongo";
import User from "@/models/User";
import { Types } from "mongoose";

export async function PUT(
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
    const { name, description, wallpaperId, action } = body;

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const collection = user.collections?.find(
      (c) => c._id?.toString() === id
    );

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Update collection
    if (name) collection.name = name.trim();
    if (description !== undefined) collection.description = description?.trim() || "";

    // Add or remove wallpaper
    if (wallpaperId && action) {
      if (action === "add") {
        if (!collection.wallpapers.some((w) => w.toString() === wallpaperId)) {
          collection.wallpapers.push(new Types.ObjectId(wallpaperId));
        }
      } else if (action === "remove") {
        collection.wallpapers = collection.wallpapers.filter(
          (w) => w.toString() !== wallpaperId
        );
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      collection,
    });
  } catch (error: any) {
    console.error("Error updating collection:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
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

    user.collections = user.collections?.filter(
      (c) => c._id?.toString() !== id
    ) || [];

    await user.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

