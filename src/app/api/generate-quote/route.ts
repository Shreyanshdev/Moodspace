import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateQuote, QuoteOptions } from "@/lib/quoteGenerator";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { wallpaperId, userInput, quoteType, mood, style, styleOptions } = body;

    if (!wallpaperId) {
      return NextResponse.json(
        { error: "Wallpaper ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const wallpaper = await Wallpaper.findById(wallpaperId);
    if (!wallpaper || wallpaper.userId?.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Wallpaper not found" },
        { status: 404 }
      );
    }

    // Generate quote
    const quoteOptions: QuoteOptions = {
      prompt: wallpaper.prompt,
      mood: mood || wallpaper.mood,
      style: style || wallpaper.style,
      userInput,
      quoteType: quoteType || "inspirational",
    };

    const quote = await generateQuote(quoteOptions);

    // Apply style options if provided
    if (styleOptions) {
      quote.style = {
        ...quote.style,
        fontSize: styleOptions.fontSize || quote.style.fontSize,
        fontFamily: styleOptions.fontFamily || quote.style.fontFamily,
        color: styleOptions.color || quote.style.color,
        opacity: styleOptions.bgOpacity !== undefined ? styleOptions.bgOpacity : quote.style.opacity,
      };
    }

    // Update wallpaper with quote
    if (!wallpaper.quotes) {
      wallpaper.quotes = [];
    }
    wallpaper.quotes.push(quote);
    await wallpaper.save();

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error: any) {
    console.error("Error generating quote:", error);
    return NextResponse.json(
      { error: "Failed to generate quote", message: error.message },
      { status: 500 }
    );
  }
}

