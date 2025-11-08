import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (sessionId) {
    // Credits should already be added via webhook
    redirect("/dashboard?payment=success");
  }

  redirect("/dashboard");
}

