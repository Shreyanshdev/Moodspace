import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkGuestLimit } from "@/utils/creditManager";
import { getUserCredits } from "@/utils/creditManager";
import connectDB from "@/lib/mongo";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user) {
      // Logged in user - check for monthly reset
      await connectDB();
      const user = await User.findOne({ email: session.user.email });
      
      if (user) {
        // Check if monthly reset is needed
        const now = new Date();
        const lastReset = user.lastCreditReset || user.createdAt || now;
        const daysSinceReset = Math.floor(
          (now.getTime() - new Date(lastReset).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceReset >= 30 && user.subscriptionTier === "free") {
          // Reset to 5 credits for free tier
          user.credits = 5;
          user.lastCreditReset = now;
          await user.save();
        }

        const credits = await getUserCredits(session.user.userId);
        return NextResponse.json({
          credits,
          isGuest: false,
        });
      }
      
      const credits = await getUserCredits(session.user.userId);
      return NextResponse.json({
        credits,
        isGuest: false,
      });
    } else {
      // Guest user
      const guestCheck = await checkGuestLimit();
      return NextResponse.json({
        credits: guestCheck.remaining,
        isGuest: true,
        limit: 1,
      });
    }
  } catch (error: any) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits", message: error.message },
      { status: 500 }
    );
  }
}

