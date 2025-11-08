import { Navbar } from "@/components/server/Navbar";
import { Footer } from "@/components/server/Footer";
import { EnhancedGeneratorForm } from "@/components/client/EnhancedGeneratorForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generate Wallpaper - MoodScape",
  description: "Generate beautiful AI wallpapers from text prompts",
};

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-neutral-800">
      <Navbar />
      <EnhancedGeneratorForm />
      <Footer />
    </div>
  );
}

