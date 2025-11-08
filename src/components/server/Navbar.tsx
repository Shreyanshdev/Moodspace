import Link from "next/link";
import { CreditBadge } from "@/components/client/CreditBadge";
import { auth } from "@/lib/auth";
import { SignInButton } from "@/components/client/SignInButton";
import { UserMenu } from "@/components/client/UserMenu";
import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
});

export async function Navbar() {
  const session = await auth();

  return (
    // i want to make  navbar blur not blackdrop make it blur like this <nav className="sticky top-0 z-50 w-11/12 mx-auto mt-3 border border-neutral-800 bg-gradient-to-r from-black via-neutral-900 to-black backdrop-blur-md rounded-2xl shadow-[0_0_40px_rgba(255,0,0,0.08)] transition-all duration-700">
    <nav className="sticky top-0 z-50 w-11/12 mx-auto mt-3 border border-neutral-800 bg-gradient-to-r from-black/30 via-neutral-900/95 to-black/95 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(255,0,0,0.2)] transition-all duration-700">
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
              <CreditBadge credits={session.user.credits} />
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
