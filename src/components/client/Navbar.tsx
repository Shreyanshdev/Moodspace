"use client";

import Link from "next/link";
import { CreditBadge } from "@/components/client/CreditBadge";
import { SignInButton } from "@/components/client/SignInButton";
import { UserMenu } from "@/components/client/UserMenu";
import { Dancing_Script } from "next/font/google";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
});

export function Navbar() {
  const { data: session, update } = useSession();
  const [credits, setCredits] = useState<number>(session?.user?.credits || 0);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch credits on mount and when session changes
  useEffect(() => {
    setIsMounted(true);
    if (session?.user) {
      fetchCredits();
    }
  }, [session]);

  // Handle scroll for backdrop filter
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Poll for credit updates (only when user is logged in)
  useEffect(() => {
    if (!session?.user) return;

    const interval = setInterval(() => {
      fetchCredits();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [session?.user]);

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/credits");
      if (response.ok) {
        const data = await response.json();
        if (!data.isGuest && data.credits !== credits) {
          setCredits(data.credits);
          // Update session to reflect new credits
          await update();
        }
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  if (!isMounted) {
    // Return server-side compatible version on first render
    return (
      <nav className="sticky top-0 z-50 w-11/12 mx-auto mt-3 bg-gradient-to-r from-black via-neutral-900 to-black backdrop-blur-md rounded-2xl shadow-[0_0_40px_rgba(255,0,0,0.08)] transition-all duration-700">
        <div className="flex h-16 items-center justify-between px-8">
          <Link href="/" className="relative group select-none">
            <span
              className={`text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white group-hover:from-red-600 group-hover:via-white group-hover:to-gray-200 transition-all duration-700 ease-out ${dancingScript.className}`}
            >
              MoodScape
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-white group-hover:w-full transition-all duration-700"></span>
          </Link>
          <div className="flex items-center gap-10">
            <Link
              href="/gallery"
              className="relative text-sm font-medium text-neutral-300 hover:text-white tracking-wide transition-all duration-300 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-red-600 hover:after:w-full after:transition-all after:duration-500"
            >
              Gallery
            </Link>
            <Link
              href="/generate"
              className="relative text-sm font-medium text-neutral-300 hover:text-white tracking-wide transition-all duration-300 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-red-600 hover:after:w-full after:transition-all after:duration-500"
            >
              Generate
            </Link>
            <SignInButton />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`sticky top-0 z-50 w-11/12 mx-auto mt-3 transition-all duration-700 ${
        scrolled
          ? "border border-neutral-800 bg-gradient-to-r from-black/95 via-neutral-900/95 to-black/95 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(255,0,0,0.08)]"
          : "bg-transparent rounded-2xl"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-8">
        {/* Wordmark with luxurious style */}
        <Link href="/" className="relative group select-none">
          <span
            className={`text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white group-hover:from-red-600 group-hover:via-white group-hover:to-gray-200 transition-all duration-700 ease-out ${dancingScript.className}`}
          >
            MoodScape
          </span>
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-white group-hover:w-full transition-all duration-700"></span>
        </Link>

        {/* Navigation and user actions */}
        <div className="flex items-center gap-10">
          <Link
            href="/gallery"
            className="relative text-sm font-medium text-neutral-300 hover:text-white tracking-wide transition-all duration-300 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-red-600 hover:after:w-full after:transition-all after:duration-500"
          >
            Gallery
          </Link>
          <Link
            href="/generate"
            className="relative text-sm font-medium text-neutral-300 hover:text-white tracking-wide transition-all duration-300 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-red-600 hover:after:w-full after:transition-all after:duration-500"
          >
            Generate
          </Link>

          {session?.user ? (
            <>
              <CreditBadge credits={credits} />
              <UserMenu user={session.user} />
            </>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </nav>
  );
}

