"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Sparkles, Lightbulb, Upload, X, Image as ImageIcon, Wand2, Check } from "lucide-react";
import { WallpaperPreview } from "./WallpaperPreview";
import { PROMPT_TEMPLATES, PromptTemplate } from "@/utils/promptTemplates";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function EnhancedGeneratorForm() {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState("");
  const [style, setStyle] = useState("");
  const [aspect, setAspect] = useState<"16:9" | "9:16" | "21:9">("16:9");
  const [quality, setQuality] = useState<"standard" | "premium" | "ultra">("standard");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    id: string;
    imageUrl: string;
    prompt: string;
    aspect: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"prompt" | "templates" | "image">("prompt");
  
  // AI Prompt Suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsDismissed, setSuggestionsDismissed] = useState(false);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions as user types
  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (prompt.trim().length === 0) {
      setSuggestionsDismissed(false);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (suggestionsDismissed || prompt.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    suggestionsTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/suggest-prompt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 500);

    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [prompt, suggestionsDismissed]);

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleDismissSuggestions = () => {
    setShowSuggestions(false);
    setSuggestionsDismissed(true);
    inputRef.current?.focus();
  };

  const handleTemplateSelect = (template: PromptTemplate) => {
    setPrompt(template.prompt);
    setMood(template.mood || "");
    setStyle(template.style || "");
    setActiveTab("prompt");
    toast.success(`Template "${template.name}" selected`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setReferenceImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setReferenceImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setActiveTab("prompt");
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!session?.user) {
      toast.error("Please sign in to generate wallpapers");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let response;
      
      if (referenceImageFile) {
        // Image-to-image generation
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("mood", mood);
        formData.append("style", style);
        formData.append("aspect", aspect);
        formData.append("quality", quality);
        formData.append("image", referenceImageFile);

        response = await fetch("/api/generate-with-image", {
          method: "POST",
          body: formData,
        });
      } else {
        // Text-to-image generation
        response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            mood,
            style,
            aspect,
            quality,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate wallpaper");
      }

      // Handle both response formats: { wallpaper: {...} } or { id, imageUrl, ... }
      const wallpaper = data.wallpaper || data;
      
      if (wallpaper.imageUrl && wallpaper.id) {
        setResult({
          id: wallpaper.id,
          imageUrl: wallpaper.imageUrl,
          prompt: wallpaper.prompt || data.prompt || prompt,
          aspect: wallpaper.aspect || data.aspect || aspect,
        });
      } else {
        throw new Error("Invalid response: missing image URL or ID");
      }

      toast.success("Wallpaper generated successfully!");
      
      // Reset form
      setPrompt("");
      setMood("");
      setStyle("");
      setReferenceImage(null);
      setReferenceImageFile(null);
    } catch (error: any) {
      console.error("Error generating wallpaper:", error);
      toast.error(error.message || "Failed to generate wallpaper");
    } finally {
      setLoading(false);
    }
  };

  const moods = ["calm", "energetic", "mysterious", "peaceful", "vibrant"];
  const styles = ["minimalist", "realistic", "abstract", "fantasy", "cyberpunk"];
  const aspects = [
    { value: "16:9", label: "16:9 (Widescreen)" },
    { value: "9:16", label: "9:16 (Portrait)" },
    { value: "21:9", label: "21:9 (Ultrawide)" },
  ];
  const qualities = [
    { value: "standard", label: "Standard" },
    { value: "premium", label: "Premium" },
    { value: "ultra", label: "Ultra" },
  ];

  // Group templates by category
  const templatesByCategory = PROMPT_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, PromptTemplate[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-neutral-800 py-12 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70">
            AI Wallpaper Generator
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Create Your Perfect Wallpaper
          </h1>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
            Describe your vision or choose from our curated templates
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setActiveTab("prompt")}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "prompt"
                    ? "bg-gradient-to-r from-red-700 to-neutral-700 text-white shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Text Prompt
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "templates"
                    ? "bg-gradient-to-r from-red-700 to-neutral-700 text-white shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab("image")}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "image"
                    ? "bg-gradient-to-r from-red-700 to-neutral-700 text-white shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Image Upload
              </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "prompt" && (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Prompt Input */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-white mb-2">
                      Describe Your Wallpaper
                    </label>
                    <div className="relative">
                      <textarea
                        ref={inputRef as any}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A serene sunset over mountains with vibrant colors..."
                        className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none min-h-[120px] backdrop-blur-md transition-all"
                      />
                      {loadingSuggestions && (
                        <div className="absolute top-3 right-3">
                          <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                        </div>
                      )}
                    </div>

                    {/* AI Suggestions */}
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 mt-2 w-full rounded-xl bg-black/90 border border-neutral-700 shadow-2xl backdrop-blur-xl"
                        >
                          <div className="flex items-center justify-between border-b border-neutral-700 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-semibold text-white">AI Suggestions</span>
                            </div>
                            <button
                              onClick={handleDismissSuggestions}
                              className="text-neutral-400 hover:text-white transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSuggestionClick(suggestion);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-neutral-300 hover:bg-white/5 transition-colors border-b border-neutral-800 last:border-0"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mood & Style */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Mood</label>
                      <select
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
                      >
                        <option value="" className="bg-neutral-900">Any Mood</option>
                        {moods.map((m) => (
                          <option key={m} value={m} className="bg-neutral-900 capitalize">
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Style</label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
                      >
                        <option value="" className="bg-neutral-900">Any Style</option>
                        {styles.map((s) => (
                          <option key={s} value={s} className="bg-neutral-900 capitalize">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Aspect Ratio & Quality */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Aspect Ratio</label>
                      <select
                        value={aspect}
                        onChange={(e) => setAspect(e.target.value as "16:9" | "9:16" | "21:9")}
                        className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
                      >
                        {aspects.map((a) => (
                          <option key={a.value} value={a.value} className="bg-neutral-900">
                            {a.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Quality</label>
                      <select
                        value={quality}
                        onChange={(e) => setQuality(e.target.value as "standard" | "premium" | "ultra")}
                        className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
                      >
                        {qualities.map((q) => (
                          <option key={q.value} value={q.value} className="bg-neutral-900">
                            {q.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className="w-full px-8 py-4 bg-gradient-to-r from-red-700 to-neutral-700 text-white font-semibold text-lg rounded-xl shadow-md hover:from-red-600 hover:to-neutral-800 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-5 w-5" />
                        Generate Wallpaper
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {activeTab === "templates" && (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="text-center py-4">
                    <p className="text-neutral-400 text-sm mb-2">
                      <Sparkles className="h-4 w-4 inline mr-1" />
                      Click a template to auto-fill your prompt
                    </p>
                  </div>
                  
                  <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                    {Object.entries(templatesByCategory).map(([category, templates]) => (
                      <div key={category} className="space-y-3">
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                          {category}
                        </h3>
                        <div className="grid gap-3">
                          {templates.map((template) => (
                            <button
                              key={template.id}
                              onClick={() => handleTemplateSelect(template)}
                              className="text-left p-4 rounded-xl bg-white/5 border border-neutral-700 hover:bg-white/10 hover:border-red-600/50 transition-all group"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white mb-1 group-hover:text-red-400 transition-colors">
                                    {template.name}
                                  </h4>
                                  <p className="text-sm text-neutral-400 line-clamp-2">
                                    {template.description}
                                  </p>
                                </div>
                                <Check className="h-5 w-5 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "image" && (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="text-center py-4">
                    <p className="text-neutral-400 text-sm">
                      Upload a reference image to generate a wallpaper from it
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {referenceImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-neutral-700">
                        <Image
                          src={referenceImage}
                          alt="Reference"
                          width={600}
                          height={400}
                          className="w-full h-auto"
                        />
                        <button
                          onClick={() => {
                            setReferenceImage(null);
                            setReferenceImageFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="absolute top-2 right-2 p-2 bg-black/70 rounded-lg text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-12 border-2 border-dashed border-neutral-700 rounded-xl bg-white/5 hover:bg-white/10 hover:border-red-600/50 transition-all group"
                      >
                        <Upload className="h-12 w-12 text-neutral-500 group-hover:text-red-500 mx-auto mb-4 transition-colors" />
                        <p className="text-white font-semibold mb-2">Upload Reference Image</p>
                        <p className="text-sm text-neutral-400">PNG, JPG up to 10MB</p>
                      </button>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-neutral-700">
                    <p className="text-sm text-neutral-400">
                      <strong className="text-white">How it works:</strong> Upload an image and describe how you want it transformed. The AI will create a new wallpaper based on your reference image and prompt.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right: Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:sticky lg:top-8 lg:h-fit"
          >
            {result ? (
              <div className="space-y-4">
                <WallpaperPreview
                  wallpaper={{
                    id: result.id,
                    imageUrl: result.imageUrl,
                    prompt: result.prompt,
                    aspect: result.aspect,
                  }}
                />
                <Link
                  href="/dashboard"
                  className="block w-full px-6 py-3 text-center bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all"
                >
                  View in Dashboard
                </Link>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center rounded-xl bg-white/5 border border-neutral-700 backdrop-blur-md">
                <div className="text-center space-y-4">
                  <ImageIcon className="h-16 w-16 text-neutral-600 mx-auto" />
                  <p className="text-neutral-400">Your generated wallpaper will appear here</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
