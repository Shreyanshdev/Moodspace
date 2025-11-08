import { notFound } from "next/navigation";
import { Navbar } from "@/components/server/Navbar";
import { Footer } from "@/components/server/Footer";
import { EditorControls } from "@/components/client/EditorControls";
import { EditorCanvas } from "@/components/client/EditorCanvas";
import connectDB from "@/lib/mongo";
import Wallpaper from "@/models/Wallpaper";
import { Metadata } from "next";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditorPageProps): Promise<Metadata> {
  const { id } = await params;
  await connectDB();
  const wallpaper = await Wallpaper.findById(id);

  if (!wallpaper) {
    return {
      title: "Wallpaper Not Found - MoodScape",
    };
  }

  return {
    title: `Edit ${wallpaper.prompt} - MoodScape`,
    description: `Edit and customize your wallpaper: ${wallpaper.prompt}`,
  };
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;
  await connectDB();
  const wallpaper = await Wallpaper.findById(id);

  if (!wallpaper) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-neutral-800" id="editor-page">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="inline-block mb-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70">
            Editor
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Edit Your Wallpaper
          </h1>
        </div>
        {/* ✅ Fixed layout: left fixed, right scrollable */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-12rem)] gap-6">
          {/* Left: Fixed Wallpaper */}
          <div className="lg:sticky lg:top-4 h-fit w-full lg:max-w-2xl flex-shrink-0">
            <EditorCanvas
              imageUrl={wallpaper.imageUrl}
              wallpaperId={id}
              quotes={wallpaper.quotes ? JSON.parse(JSON.stringify(wallpaper.quotes)) : []}
            />
          </div>
          
          {/* Right: Scrollable Controls */}
          <div className="flex-1 overflow-y-auto pr-2 relative z-0">
            <div className="max-w-md mx-auto lg:mx-0">
              <EditorControls
                wallpaperId={id}
                initialPrompt={wallpaper.prompt}
                initialMood={wallpaper.mood}
                initialStyle={wallpaper.style}
                initialFilters={wallpaper.filters ? JSON.parse(JSON.stringify(wallpaper.filters)) : {}}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

