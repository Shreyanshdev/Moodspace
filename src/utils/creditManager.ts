import { cookies } from "next/headers";
import User from "@/models/User";
import connectDB from "@/lib/mongo";

const GUEST_GENERATION_LIMIT = 1;
const GUEST_COOKIE_NAME = "guest_generations";

export async function checkGuestLimit(): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const cookieStore = await cookies();
  const guestCount = cookieStore.get(GUEST_COOKIE_NAME);

  const count = guestCount ? parseInt(guestCount.value, 10) : 0;

  if (count >= GUEST_GENERATION_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining: GUEST_GENERATION_LIMIT - count,
  };
}

export async function incrementGuestGeneration(): Promise<void> {
  const cookieStore = await cookies();
  const guestCount = cookieStore.get(GUEST_COOKIE_NAME);
  const count = guestCount ? parseInt(guestCount.value, 10) : 0;

  cookieStore.set(GUEST_COOKIE_NAME, (count + 1).toString(), {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function checkUserCredits(
  userId: string
): Promise<{ allowed: boolean; credits: number }> {
  await connectDB();
  const user = await User.findOne({ userId });

  if (!user) {
    return { allowed: false, credits: 0 };
  }

  return {
    allowed: user.credits > 0,
    credits: user.credits,
  };
}

export async function deductCredit(userId: string): Promise<number> {
  await connectDB();
  const user = await User.findOneAndUpdate(
    { userId, credits: { $gt: 0 } },
    { $inc: { credits: -1 } },
    { new: true }
  );

  if (!user) {
    throw new Error("Insufficient credits or user not found");
  }

  return user.credits;
}

export async function getUserCredits(userId: string): Promise<number> {
  await connectDB();
  const user = await User.findOne({ userId });
  return user?.credits ?? 0;
}

