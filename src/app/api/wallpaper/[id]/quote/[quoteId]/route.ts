import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quoteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id, quoteId } = await params;
    const body = await request.json();
    const { position, style } = body;

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

    if (!wallpaper.quotes || wallpaper.quotes.length === 0) {
      return NextResponse.json(
        { error: "No quotes found" },
        { status: 404 }
      );
    }

    // Find and update the quote
    const quoteIndex = wallpaper.quotes.findIndex(
      (q: any) => q._id?.toString() === quoteId || (q as any).id === quoteId
    );

    if (quoteIndex === -1) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      );
    }

    // Update quote position and/or style
    if (position) {
      wallpaper.quotes[quoteIndex].position = {
        x: Math.max(0, Math.min(100, position.x)),
        y: Math.max(0, Math.min(100, position.y)),
      };
    }

    if (style) {
      wallpaper.quotes[quoteIndex].style = {
        ...wallpaper.quotes[quoteIndex].style,
        ...style,
      };
    }

    await wallpaper.save();

    return NextResponse.json({
      success: true,
      quote: wallpaper.quotes[quoteIndex],
    });
  } catch (error: any) {
    console.error("Error updating quote:", error);
    return NextResponse.json(
      { error: "Failed to update quote", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quoteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id, quoteId } = await params;

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

    if (!wallpaper.quotes || wallpaper.quotes.length === 0) {
      return NextResponse.json(
        { error: "No quotes found" },
        { status: 404 }
      );
    }

    // Find and remove the quote
    const quoteIndex = wallpaper.quotes.findIndex(
      (q: any) => q._id?.toString() === quoteId || (q as any).id === quoteId
    );

    if (quoteIndex === -1) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      );
    }

    // Remove the quote
    wallpaper.quotes.splice(quoteIndex, 1);
    await wallpaper.save();

    return NextResponse.json({
      success: true,
      message: "Quote deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting quote:", error);
    return NextResponse.json(
      { error: "Failed to delete quote", message: error.message },
      { status: 500 }
    );
  }
}
