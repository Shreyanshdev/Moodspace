"use client";

import { useState } from "react";
import { Loader2, Sparkles, Quote, Type, Palette, Move } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface QuoteGeneratorPanelProps {
  wallpaperId: string;
  wallpaperPrompt?: string;
  wallpaperMood?: string;
  wallpaperStyle?: string;
}

export function QuoteGeneratorPanel({
  wallpaperId,
  wallpaperPrompt,
  wallpaperMood,
  wallpaperStyle,
}: QuoteGeneratorPanelProps) {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [quoteType, setQuoteType] = useState<"inspirational" | "motivational" | "philosophical" | "poetic" | "custom">("inspirational");
  const [generating, setGenerating] = useState(false);
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("serif");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [bgOpacity, setBgOpacity] = useState(0.6);

  const handleGenerateQuote = async () => {
    if (!userInput.trim() && quoteType !== "custom") {
      toast.error("Please enter what kind of quote you want or select a quote type");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/generate-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallpaperId,
          userInput: userInput.trim() || undefined,
          quoteType,
          mood: wallpaperMood,
          style: wallpaperStyle,
          styleOptions: {
            fontSize,
            fontFamily,
            color: textColor,
            bgOpacity,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quote");
      }

      toast.success("Quote generated! Click and drag on canvas to position it.");
      router.refresh();
      setUserInput("");
    } catch (error: any) {
      console.error("Error generating quote:", error);
      toast.error(error.message || "Failed to generate quote");
    } finally {
      setGenerating(false);
    }
  };

  const fontFamilies = [
    { value: "serif", label: "Serif" },
    { value: "sans-serif", label: "Sans Serif" },
    { value: "monospace", label: "Monospace" },
    { value: "cursive", label: "Cursive" },
    { value: "fantasy", label: "Fantasy" },
  ];

  return (
    <div className="rounded-xl bg-white/5 border border-neutral-700 backdrop-blur-md p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Quote className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-white">AI Quote Generator</h3>
        </div>
        <p className="text-sm text-neutral-400">
          Generate beautiful quotes and drag them to position on the canvas
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">Quote Type</label>
          <select
            value={quoteType}
            onChange={(e) => setQuoteType(e.target.value as typeof quoteType)}
            disabled={generating}
            className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
          >
            <option value="inspirational" className="bg-neutral-900">Inspirational</option>
            <option value="motivational" className="bg-neutral-900">Motivational</option>
            <option value="philosophical" className="bg-neutral-900">Philosophical</option>
            <option value="poetic" className="bg-neutral-900">Poetic</option>
            <option value="custom" className="bg-neutral-900">Custom</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            {quoteType === "custom" 
              ? "Enter your quote" 
              : "What kind of quote? (Optional)"}
          </label>
          <textarea
            placeholder={
              quoteType === "custom"
                ? "Enter your quote text"
                : "e.g., about success, love, nature, dreams..."
            }
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={generating}
            className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none min-h-[100px] backdrop-blur-md transition-all"
          />
        </div>

        {/* Styling Options */}
        <div className="space-y-4 pt-4 border-t border-neutral-700">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Palette className="h-4 w-4 text-red-500" />
            Styling Options
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white">Font Size</label>
                <span className="text-sm text-neutral-400">{fontSize}px</span>
              </div>
              <input
                type="range"
                min={24}
                max={96}
                step={4}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${((fontSize - 24) / (96 - 24)) * 100}%, rgba(255,255,255,0.1) ${((fontSize - 24) / (96 - 24)) * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value} className="bg-neutral-900">
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-16 h-10 rounded-lg border border-neutral-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="#FFFFFF"
                  className="flex-1 px-4 py-2 bg-white/5 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white">Background Opacity</label>
                <span className="text-sm text-neutral-400">{Math.round(bgOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={bgOpacity}
                onChange={(e) => setBgOpacity(Number(e.target.value))}
                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${bgOpacity * 100}%, rgba(255,255,255,0.1) ${bgOpacity * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerateQuote}
          disabled={generating || (quoteType === "custom" && !userInput.trim())}
          className="w-full px-4 py-3 bg-gradient-to-r from-red-700 to-neutral-700 text-white font-semibold rounded-xl hover:from-red-600 hover:to-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate & Insert Quote
            </>
          )}
        </button>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-neutral-700">
          <Move className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-neutral-400">
            After generating, click and drag the quote on the canvas to position it exactly where you want.
          </p>
        </div>
      </div>
    </div>
  );
}
