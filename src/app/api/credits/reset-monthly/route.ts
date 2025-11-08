import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongo";
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

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if it's been a month since last reset
    const now = new Date();
    const lastReset = user.lastCreditReset || user.createdAt || now;
    const daysSinceReset = Math.floor(
      (now.getTime() - new Date(lastReset).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceReset >= 30) {
      // Reset to 5 credits for free tier
      user.credits = 5;
      user.lastCreditReset = now;
      await user.save();

      return NextResponse.json({
        success: true,
        credits: 5,
        message: "Monthly credits reset",
      });
    }

    return NextResponse.json({
      success: false,
      credits: user.credits,
      daysRemaining: 30 - daysSinceReset,
      message: "Not yet time for monthly reset",
    });
  } catch (error: any) {
    console.error("Error resetting monthly credits:", error);
    return NextResponse.json(
      { error: "Failed to reset credits", message: error.message },
      { status: 500 }
    );
  }
}

