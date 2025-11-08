"use client";

import Image from "next/image";
import Link from "next/link";
import { Edit, Download, Sparkles, ImageIcon, Loader2, Wand2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface DashboardContentProps {
  user: {
    name: string;
    email: string;
    credits: number;
  };
  wallpapers: Array<{
    id: string;
    imageUrl: string;
    prompt: string;
    aspect: string;
    createdAt: string;
  }>;
}

export function DashboardContent({ user, wallpapers }: DashboardContentProps) {
  const router = useRouter();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDownload = async (imageUrl: string, id: string) => {
    setDownloading(id);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wallpaper-${id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Wallpaper downloaded!");
    } catch (error) {
      console.error("Error downloading wallpaper:", error);
      toast.error("Failed to download wallpaper");
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wallpaper? This action cannot be undone.")) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/wallpaper/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete wallpaper");
      }

      toast.success("Wallpaper deleted successfully");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting wallpaper:", error);
      toast.error(error.message || "Failed to delete wallpaper");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div>
              <div className="inline-block mb-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70">
                Your Dashboard
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
                Welcome back, {user.name?.split(" ")[0] || "User"}!
              </h1>
              <p className="text-lg text-neutral-300">
                {wallpapers.length === 0
                  ? "Start creating your first wallpaper"
                  : `You have ${wallpapers.length} saved wallpaper${wallpapers.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-neutral-700 backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-sm text-neutral-400">Credits</div>
                <div className="text-2xl font-bold text-white">{user.credits}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wallpapers Grid */}
        {wallpapers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="inline-flex p-6 rounded-2xl bg-white/5 border border-neutral-700 mb-6">
              <ImageIcon className="h-16 w-16 text-neutral-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No wallpapers yet</h2>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto">
              Create your first stunning wallpaper with AI-powered generation
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-700 to-neutral-700 text-white font-semibold text-lg rounded-xl shadow-md hover:from-red-600 hover:to-neutral-800 hover:scale-105 transition-all duration-300"
            >
              <Wand2 className="h-5 w-5" />
              Create Your First Wallpaper
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {wallpapers.map((wallpaper, index) => (
              <motion.div
                key={wallpaper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-xl bg-white/5 border border-neutral-700 backdrop-blur-md hover:bg-white/10 hover:border-red-600/50 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={wallpaper.imageUrl}
                    alt={wallpaper.prompt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-sm line-clamp-2 mb-3">{wallpaper.prompt}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-sm text-neutral-400 line-clamp-2 mb-4 min-h-[40px]">
                    {wallpaper.prompt}
                  </p>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/editor/${wallpaper.id}`}
                      className="flex-1 px-3 py-2 bg-white/5 border border-neutral-700 rounded-lg text-white text-sm font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDownload(wallpaper.imageUrl, wallpaper.id)}
                      disabled={downloading === wallpaper.id || deleting === wallpaper.id}
                      className="flex-1 px-3 py-2 bg-white/5 border border-neutral-700 rounded-lg text-white text-sm font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading === wallpaper.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          ...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(wallpaper.id)}
                      disabled={deleting === wallpaper.id || downloading === wallpaper.id}
                      className="px-3 py-2 bg-red-900/20 border border-red-700/50 rounded-lg text-red-400 text-sm font-semibold hover:bg-red-900/30 hover:border-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting === wallpaper.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Quick Actions */}
        {wallpapers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/generate"
              className="px-8 py-4 bg-gradient-to-r from-red-700 to-neutral-700 text-white font-semibold text-lg rounded-xl shadow-md hover:from-red-600 hover:to-neutral-800 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Wand2 className="h-5 w-5" />
              Create New Wallpaper
            </Link>
            <Link
              href="/gallery"
              className="px-8 py-4 bg-white/5 border border-neutral-700 text-white font-semibold text-lg rounded-xl hover:bg-white/10 hover:border-red-600/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Explore Gallery
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
