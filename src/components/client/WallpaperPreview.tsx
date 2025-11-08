"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Edit, Download, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WallpaperPreviewProps {
  wallpaper: {
    id: string;
    imageUrl: string;
    prompt: string;
    aspect: string;
  };
  onEdit?: () => void;
}

export function WallpaperPreview({ wallpaper, onEdit }: WallpaperPreviewProps) {
  const { data: session } = useSession();
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDownload = async () => {
    if (!session?.user) {
      toast.error("Please sign in to download");
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(wallpaper.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wallpaper-${wallpaper.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Wallpaper downloaded!");
    } catch (error) {
      console.error("Error downloading wallpaper:", error);
      toast.error("Failed to download wallpaper");
    } finally {
      setDownloading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user) {
      toast.error("Please sign in to save");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallpaperId: wallpaper.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save wallpaper");
      }

      toast.success("Wallpaper saved to your profile!");
    } catch (error: any) {
      console.error("Error saving wallpaper:", error);
      toast.error(error.message || "Failed to save wallpaper");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl bg-white/5 border border-neutral-700 backdrop-blur-md overflow-hidden">
      <div className="p-6 border-b border-neutral-700">
        <h3 className="text-lg font-semibold text-white mb-2">Your Generated Wallpaper</h3>
        <p className="text-sm text-neutral-400 line-clamp-2">{wallpaper.prompt}</p>
      </div>
      <div className="p-6 space-y-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-neutral-700">
          {wallpaper.imageUrl ? (
            <Image
              src={wallpaper.imageUrl}
              alt={wallpaper.prompt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5">
              <p className="text-neutral-400 text-sm">No image available</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onEdit || (() => window.location.href = `/editor/${wallpaper.id}`)}
            className="flex-1 px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || !session?.user}
            className="flex-1 px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download
              </>
            )}
          </button>
          {session?.user && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-700 to-neutral-700 rounded-xl text-white font-semibold hover:from-red-600 hover:to-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save to Profile
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

