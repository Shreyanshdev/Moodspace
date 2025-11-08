import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default async function PaymentSuccessPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-900/20 border border-green-700/50 mb-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
        <p className="text-neutral-300">
          Your credits have been added to your account. You can now start generating wallpapers!
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gradient-to-r from-red-700 to-neutral-700 text-white font-semibold rounded-xl hover:from-red-600 hover:to-neutral-800 transition-all"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/generate"
            className="px-6 py-3 bg-white/5 border border-neutral-700 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-red-600/50 transition-all"
          >
            Generate Wallpaper
          </Link>
        </div>
      </div>
    </div>
  );
}

