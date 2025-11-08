import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/server/Navbar";
import { Footer } from "@/components/server/Footer";
import { DashboardContent } from "@/components/client/DashboardContent";
import connectDB from "@/lib/mongo";
import User from "@/models/User";
import Wallpaper from "@/models/Wallpaper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - MoodScape",
  description: "View your saved wallpapers and manage your account",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    redirect("/");
  }

  // Fetch user's wallpapers
  const wallpapers = await Wallpaper.find({
    _id: { $in: user.wallpapers },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-neutral-800">
      <Navbar />
      <DashboardContent
        user={{
          name: user.name,
          email: user.email,
          credits: user.credits,
        }}
        wallpapers={wallpapers.map((w) => ({
          id: w._id.toString(),
          imageUrl: w.imageUrl,
          prompt: w.prompt,
          aspect: w.aspect,
          createdAt: w.createdAt?.toISOString() || "",
        }))}
      />
      <Footer />
    </div>
  );
}

