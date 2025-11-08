"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles, Lightbulb } from "lucide-react";
import { WallpaperPreview } from "./WallpaperPreview";

export function GeneratorForm() {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState("");
  const [style, setStyle] = useState("");
  const [aspect, setAspect] = useState<"16:9" | "9:16" | "21:9">("16:9");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    id: string;
    imageUrl: string;
    prompt: string;
    aspect: string;
  } | null>(null);
  
  // ✅ AI Prompt Suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Fetch suggestions as user types
  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (prompt.trim().length < 2) {
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
    }, 500); // Debounce 500ms

    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [prompt]);

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          mood: mood || undefined,
          style: style || undefined,
          aspect,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate wallpaper");
      }

      setResult({
        id: data.wallpaper.id,
        imageUrl: data.wallpaper.imageUrl,
        prompt: data.wallpaper.prompt,
        aspect: data.wallpaper.aspect,
      });

      toast.success("Wallpaper generated successfully!");
      
      if (data.credits !== undefined) {
        toast.info(`You have ${data.credits} credits remaining`);
      }
    } catch (error: any) {
      console.error("Error generating wallpaper:", error);
      toast.error(error.message || "Failed to generate wallpaper");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Your Wallpaper
          </CardTitle>
          <CardDescription>
            Describe your wallpaper and let AI create it for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label htmlFor="prompt" className="mb-2 block text-sm font-medium">
                Describe your wallpaper
              </label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="prompt"
                  placeholder="e.g., A serene sunset over a calm ocean with soft pink and orange hues"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay to allow clicking on suggestions
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  disabled={loading}
                  required
                />
                {loadingSuggestions && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* ✅ AI Suggestions Dropdown - Fixed positioning */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border bg-background shadow-lg">
                  <div className="flex items-center gap-2 border-b px-3 py-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      AI Suggestions
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur
                          handleSuggestionClick(suggestion);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="mood" className="mb-2 block text-sm font-medium">
                  Mood (Optional)
                </label>
                <Select value={mood} onValueChange={setMood} disabled={loading}>
                  <SelectTrigger id="mood">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="mysterious">Mysterious</SelectItem>
                    <SelectItem value="peaceful">Peaceful</SelectItem>
                    <SelectItem value="vibrant">Vibrant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="style" className="mb-2 block text-sm font-medium">
                  Style (Optional)
                </label>
                <Select value={style} onValueChange={setStyle} disabled={loading}>
                  <SelectTrigger id="style">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
                    <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="aspect" className="mb-2 block text-sm font-medium">
                  Aspect Ratio
                </label>
                <Select
                  value={aspect}
                  onValueChange={(value) => setAspect(value as "16:9" | "9:16" | "21:9")}
                  disabled={loading}
                >
                  <SelectTrigger id="aspect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Desktop)</SelectItem>
                    <SelectItem value="9:16">9:16 (Mobile)</SelectItem>
                    <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Painting your vibe...
                </>
              ) : (
                "Generate Wallpaper"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <WallpaperPreview
          wallpaper={result}
          onEdit={() => {
            window.location.href = `/editor/${result.id}`;
          }}
        />
      )}
    </div>
  );
}

