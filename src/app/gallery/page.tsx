import { Navbar } from "@/components/server/Navbar";
import { Footer } from "@/components/server/Footer";
import { PublicGalleryContent } from "@/components/client/PublicGalleryContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public Gallery - MoodScape",
  description: "Browse beautiful AI wallpapers created by the community",
};

export default function PublicGalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black ">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <PublicGalleryContent />
      </main>
      <Footer />
    </div>
  );
}
