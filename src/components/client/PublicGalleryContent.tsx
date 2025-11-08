"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Edit, Heart, Star, Search, Filter, Eye, Download } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Wallpaper {
  id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  aspect: string;
  category?: string;
  mood?: string;
  style?: string;
  tags?: string[];
  likes?: number;
  views?: number;
  downloads?: number;
  createdAt: string;
}

export function PublicGalleryContent() {
  const { data: session } = useSession();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [mood, setMood] = useState<string | undefined>(undefined);
  const [style, setStyle] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState("newest");
  const [likedWallpapers, setLikedWallpapers] = useState<Set<string>>(new Set());
  const [favoritedWallpapers, setFavoritedWallpapers] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPage(1);
    fetchWallpapers();
  }, [searchQuery, category, mood, style, sortBy]);

  useEffect(() => {
    if (page > 1) {
      fetchWallpapers();
    }
  }, [page]);

  const fetchWallpapers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sortBy,
      });
      
      if (searchQuery) params.append("q", searchQuery);
      if (category && category !== "all") params.append("category", category);
      if (mood && mood !== "all") params.append("mood", mood);
      if (style && style !== "all") params.append("style", style);

      const response = await fetch(`/api/gallery/search?${params}`);
      const data = await response.json();
      if (data.wallpapers) {
        if (page === 1) {
          setWallpapers(data.wallpapers);
        } else {
          setWallpapers((prev) => [...prev, ...data.wallpapers]);
        }
        setHasMore(page < data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching wallpapers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToPersonal = async (wallpaperId: string) => {
    if (!session?.user) {
      toast.error("Please sign in to save wallpapers");
      return;
    }
    try {
      const response = await fetch(`/api/wallpaper/${wallpaperId}/save`, {
        method: "POST",
      });
      if (response.ok) {
        toast.success("Saved to your personal gallery!");
      } else {
        toast.error("Failed to save");
      }
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  const handleLike = async (wallpaperId: string) => {
    if (!session?.user) {
      toast.error("Please sign in to like wallpapers");
      return;
    }
    try {
      const response = await fetch(`/api/wallpaper/${wallpaperId}/like`, {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        setLikedWallpapers((prev) => {
          const newSet = new Set(prev);
          if (data.liked) {
            newSet.add(wallpaperId);
          } else {
            newSet.delete(wallpaperId);
          }
          return newSet;
        });
        setWallpapers((prev) =>
          prev.map((w) =>
            w.id === wallpaperId
              ? { ...w, likes: data.likes }
              : w
          )
        );
      }
    } catch (error) {
      toast.error("Failed to like wallpaper");
    }
  };

  const handleFavorite = async (wallpaperId: string) => {
    if (!session?.user) {
      toast.error("Please sign in to favorite wallpapers");
      return;
    }
    try {
      const response = await fetch(`/api/wallpaper/${wallpaperId}/favorite`, {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        setFavoritedWallpapers((prev) => {
          const newSet = new Set(prev);
          if (data.favorited) {
            newSet.add(wallpaperId);
            toast.success("Added to favorites!");
          } else {
            newSet.delete(wallpaperId);
            toast.success("Removed from favorites");
          }
          return newSet;
        });
      }
    } catch (error) {
      toast.error("Failed to favorite wallpaper");
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-500 mx-auto" />
          <p className="text-neutral-400">Loading wallpapers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="inline-block mb-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70">
          Public Gallery
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          Explore Community Wallpapers
        </h1>
        <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
          Discover stunning AI-generated wallpapers created by our community
        </p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-xl bg-white/5 border border-neutral-700 backdrop-blur-md p-6 space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search wallpapers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-neutral-700 rounded-lg text-white text-sm font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden"
            >
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Category</label>
                <select
                  value={category || "all"}
                  onChange={(e) => setCategory(e.target.value === "all" ? undefined : e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
                >
                  <option value="all" className="bg-neutral-900">All Categories</option>
                  <option value="nature" className="bg-neutral-900">Nature</option>
                  <option value="abstract" className="bg-neutral-900">Abstract</option>
                  <option value="space" className="bg-neutral-900">Space</option>
                  <option value="urban" className="bg-neutral-900">Urban</option>
                  <option value="fantasy" className="bg-neutral-900">Fantasy</option>
                  <option value="dark" className="bg-neutral-900">Dark</option>
                  <option value="calm" className="bg-neutral-900">Calm</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Mood</label>
                <select
                  value={mood || "all"}
                  onChange={(e) => setMood(e.target.value === "all" ? undefined : e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
                >
                  <option value="all" className="bg-neutral-900">All Moods</option>
                  <option value="calm" className="bg-neutral-900">Calm</option>
                  <option value="energetic" className="bg-neutral-900">Energetic</option>
                  <option value="mysterious" className="bg-neutral-900">Mysterious</option>
                  <option value="peaceful" className="bg-neutral-900">Peaceful</option>
                  <option value="vibrant" className="bg-neutral-900">Vibrant</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Style</label>
                <select
                  value={style || "all"}
                  onChange={(e) => setStyle(e.target.value === "all" ? undefined : e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
                >
                  <option value="all" className="bg-neutral-900">All Styles</option>
                  <option value="minimalist" className="bg-neutral-900">Minimalist</option>
                  <option value="realistic" className="bg-neutral-900">Realistic</option>
                  <option value="abstract" className="bg-neutral-900">Abstract</option>
                  <option value="fantasy" className="bg-neutral-900">Fantasy</option>
                  <option value="cyberpunk" className="bg-neutral-900">Cyberpunk</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
                >
                  <option value="newest" className="bg-neutral-900">Newest</option>
                  <option value="oldest" className="bg-neutral-900">Oldest</option>
                  <option value="popular" className="bg-neutral-900">Popular</option>
                  <option value="mostLiked" className="bg-neutral-900">Most Liked</option>
                  <option value="mostViewed" className="bg-neutral-900">Most Viewed</option>
                  <option value="mostDownloaded" className="bg-neutral-900">Most Downloaded</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Wallpapers Grid */}
      {wallpapers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-20"
        >
          <p className="text-xl text-neutral-400 mb-4">No wallpapers found</p>
          <p className="text-sm text-neutral-500">Try adjusting your filters</p>
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
                  alt={wallpaper.title || wallpaper.prompt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold mb-1 line-clamp-1">
                      {wallpaper.title || "Untitled"}
                    </h3>
                    <p className="text-white/80 text-sm line-clamp-2">{wallpaper.prompt}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-white font-semibold mb-1 line-clamp-1">
                    {wallpaper.title || "Untitled"}
                  </h3>
                  <p className="text-sm text-neutral-400 line-clamp-2 min-h-[40px]">
                    {wallpaper.prompt}
                  </p>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{wallpaper.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{wallpaper.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>{wallpaper.downloads || 0}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/editor/${wallpaper.id}`}
                    className="flex-1 px-3 py-2 bg-white/5 border border-neutral-700 rounded-lg text-white text-sm font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                  {session?.user && (
                    <>
                      <button
                        onClick={() => handleLike(wallpaper.id)}
                        className={`px-3 py-2 border rounded-lg text-sm font-semibold transition-all flex items-center justify-center ${
                          likedWallpapers.has(wallpaper.id)
                            ? "bg-red-600/20 border-red-600/50 text-red-400"
                            : "bg-white/5 border-neutral-700 text-white hover:bg-white/10 hover:border-red-600/50"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${likedWallpapers.has(wallpaper.id) ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleFavorite(wallpaper.id)}
                        className={`px-3 py-2 border rounded-lg text-sm font-semibold transition-all flex items-center justify-center ${
                          favoritedWallpapers.has(wallpaper.id)
                            ? "bg-yellow-600/20 border-yellow-600/50 text-yellow-400"
                            : "bg-white/5 border-neutral-700 text-white hover:bg-white/10 hover:border-red-600/50"
                        }`}
                      >
                        <Star className={`h-4 w-4 ${favoritedWallpapers.has(wallpaper.id) ? "fill-current" : ""}`} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Load More */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center pt-8"
        >
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading}
            className="px-8 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
