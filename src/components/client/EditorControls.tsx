"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wand2, RotateCcw, Undo2, Redo2, Pencil, Highlighter, Type, Eraser, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEditorStore } from "@/store/editorStore";
import { TextEditorPanel } from "./TextEditorPanel";
import { QuoteGeneratorPanel } from "./QuoteGeneratorPanel";
import { motion, AnimatePresence } from "framer-motion";

interface EditorControlsProps {
  wallpaperId: string;
  initialPrompt: string;
  initialMood?: string;
  initialStyle?: string;
  initialFilters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    sharpness?: number;
    warmth?: number;
  };
}

export function EditorControls({
  wallpaperId,
  initialPrompt,
  initialMood,
  initialStyle,
  initialFilters,
}: EditorControlsProps) {
  const router = useRouter();
  const {
    brightness,
    contrast,
    saturation,
    blur,
    sharpness,
    warmth,
    setBrightness,
    setContrast,
    setSaturation,
    setBlur,
    setSharpness,
    setWarmth,
    reset,
    loadFilters,
  } = useEditorStore();

  const [restylePrompt, setRestylePrompt] = useState("");
  const [restyling, setRestyling] = useState(false);
  const [history, setHistory] = useState<Array<{ imageUrl: string; prompt: string }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"filters" | "text" | "quotes" | "ai" | "draw">("filters");
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  // ✅ Load filters from database on mount
  useEffect(() => {
    if (initialFilters) {
      loadFilters(initialFilters);
    }
  }, [initialFilters, loadFilters]);

  // Listen for quote selection
  useEffect(() => {
    const handleQuoteSelected = (e: CustomEvent) => {
      setSelectedQuoteId(e.detail.quoteId);
      setSelectedQuote(e.detail.quote);
      if (e.detail.quoteId) {
        setActiveTab("quotes");
      }
    };

    window.addEventListener("quoteSelected", handleQuoteSelected as EventListener);
    return () => {
      window.removeEventListener("quoteSelected", handleQuoteSelected as EventListener);
    };
  }, []);

  // ✅ Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/wallpaper/${wallpaperId}/history`);
        if (response.ok) {
          const data = await response.json();
          setHistory(data.history || []);
          setHistoryIndex((data.history?.length || 1) - 1);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
    fetchHistory();
  }, [wallpaperId]);

  const handleUndo = async () => {
    if (historyIndex <= 0) return;
    setLoadingHistory(true);
    try {
      const prevVersion = history[historyIndex - 1];
      const response = await fetch(`/api/wallpaper/${wallpaperId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: prevVersion.imageUrl, prompt: prevVersion.prompt }),
      });
      if (response.ok) {
        setHistoryIndex(historyIndex - 1);
        router.refresh();
        toast.success("Restored previous version");
      }
    } catch (error) {
      toast.error("Failed to restore version");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRedo = async () => {
    if (historyIndex >= history.length - 1) return;
    setLoadingHistory(true);
    try {
      const nextVersion = history[historyIndex + 1];
      const response = await fetch(`/api/wallpaper/${wallpaperId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: nextVersion.imageUrl, prompt: nextVersion.prompt }),
      });
      if (response.ok) {
        setHistoryIndex(historyIndex + 1);
        router.refresh();
        toast.success("Restored next version");
      }
    } catch (error) {
      toast.error("Failed to restore version");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRestyle = async () => {
    if (!restylePrompt.trim()) {
      toast.error("Please enter an instruction");
      return;
    }

    setRestyling(true);
    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallpaperId: wallpaperId,
          prompt: initialPrompt,
          instruction: restylePrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to restyle wallpaper");
      }

      router.refresh();
      toast.success("Wallpaper restyled successfully!");
      setRestylePrompt("");
      // After successful restyle, refresh history
      const responseHistory = await fetch(`/api/wallpaper/${wallpaperId}/history`);
      if (responseHistory.ok) {
        const dataHistory = await responseHistory.json();
        setHistory(dataHistory.history || []);
        setHistoryIndex(dataHistory.history?.length - 1 || 0);
      }
    } catch (error: any) {
      console.error("Error restyling wallpaper:", error);
      toast.error(error.message || "Failed to restyle wallpaper");
    } finally {
      setRestyling(false);
    }
  };

  const Slider = ({ label, value, onChange, min, max, step = 1 }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
  }) => {
    const [localValue, setLocalValue] = useState(value);
    const [isDragging, setIsDragging] = useState(false);
    const percentage = ((localValue - min) / (max - min)) * 100;
    
    useEffect(() => {
      if (!isDragging) {
        setLocalValue(value);
      }
    }, [value, isDragging]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      setLocalValue(newValue);
      onChange(newValue);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      setLocalValue(newValue);
      onChange(newValue);
    };

    const handleMouseDown = () => {
      setIsDragging(true);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-white">{label}</label>
          <span className="text-sm text-neutral-400">{localValue}</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onInput={handleInput}
            onChange={handleChange}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-grab active:cursor-grabbing slider"
            style={{
              background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative z-0">
      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
        <button
          onClick={() => setActiveTab("filters")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "filters"
              ? "bg-gradient-to-r from-red-700 to-neutral-700 text-white shadow-md"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Filters
        </button>
        <button
          onClick={() => setActiveTab("text")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "text"
              ? "bg-gradient-to-r from-red-700 to-neutral-700 text-white shadow-md"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Text
        </button>
        <button
          onClick={() => setActiveTab("quotes")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "quotes"
              ? "bg-gradient-to-r from-red-700 to-neutral-700 text-white shadow-md"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Quotes
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "ai"
              ? "bg-gradient-to-r from-red-700 to-neutral-700 text-white shadow-md"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          AI Restyle
        </button>
        <button
          onClick={() => setActiveTab("draw")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "draw"
              ? "bg-gradient-to-r from-red-700 to-neutral-700 text-white shadow-md"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Draw
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "filters" && (
          <motion.div
            key="filters"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl bg-white/5 border border-neutral-700 backdrop-blur-md p-6 space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Manual Adjustments</h3>
              <p className="text-sm text-neutral-400">Adjust brightness, contrast, and other properties</p>
            </div>

            <div className="space-y-6">
              <Slider
                label="Brightness"
                value={brightness}
                onChange={setBrightness}
                min={-100}
                max={100}
              />
              <Slider
                label="Contrast"
                value={contrast}
                onChange={setContrast}
                min={-100}
                max={100}
              />
              <Slider
                label="Saturation"
                value={saturation}
                onChange={setSaturation}
                min={-100}
                max={100}
              />
              <Slider
                label="Blur"
                value={blur}
                onChange={setBlur}
                min={0}
                max={100}
              />
              <Slider
                label="Sharpness"
                value={sharpness}
                onChange={setSharpness}
                min={-100}
                max={100}
              />
              <Slider
                label="Warmth"
                value={warmth}
                onChange={setWarmth}
                min={-100}
                max={100}
              />
            </div>

            <button
              onClick={reset}
              className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All
            </button>
          </motion.div>
        )}

        {activeTab === "text" && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <TextEditorPanel />
          </motion.div>
        )}

        {activeTab === "quotes" && (
          <motion.div
            key="quotes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {selectedQuote ? (
              <div className="rounded-xl bg-white/5 border border-neutral-700 backdrop-blur-md p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Type className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-white">Edit Quote</h3>
                  </div>
                  <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{selectedQuote.text}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-white">Font Size</label>
                      <span className="text-sm text-neutral-400">{selectedQuote.style?.fontSize || 48}px</span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={96}
                      step={4}
                      value={selectedQuote.style?.fontSize || 48}
                      onChange={(e) => {
                        const newSize = Number(e.target.value);
                        fetch(`/api/wallpaper/${wallpaperId}/quote/${selectedQuoteId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ style: { ...selectedQuote.style, fontSize: newSize } }),
                        }).then(() => router.refresh());
                      }}
                      className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-white">Text Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={selectedQuote.style?.color || "#FFFFFF"}
                        onChange={(e) => {
                          fetch(`/api/wallpaper/${wallpaperId}/quote/${selectedQuoteId}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ style: { ...selectedQuote.style, color: e.target.value } }),
                          }).then(() => router.refresh());
                        }}
                        className="w-16 h-10 rounded-lg border border-neutral-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedQuote.style?.color || "#FFFFFF"}
                        onChange={(e) => {
                          fetch(`/api/wallpaper/${wallpaperId}/quote/${selectedQuoteId}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ style: { ...selectedQuote.style, color: e.target.value } }),
                          }).then(() => router.refresh());
                        }}
                        className="flex-1 px-4 py-2 bg-white/5 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-white">Text Opacity</label>
                      <span className="text-sm text-neutral-400">{Math.round((selectedQuote.style?.opacity || 0.95) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={selectedQuote.style?.opacity || 0.95}
                      onChange={(e) => {
                        const newOpacity = Number(e.target.value);
                        fetch(`/api/wallpaper/${wallpaperId}/quote/${selectedQuoteId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ style: { ...selectedQuote.style, opacity: newOpacity } }),
                        }).then(() => router.refresh());
                      }}
                      className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-white">Background Opacity</label>
                      <span className="text-sm text-neutral-400">{Math.round((selectedQuote.style?.bgOpacity !== undefined ? selectedQuote.style.bgOpacity : 0.6) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={selectedQuote.style?.bgOpacity !== undefined ? selectedQuote.style.bgOpacity : 0.6}
                      onChange={(e) => {
                        const newBgOpacity = Number(e.target.value);
                        fetch(`/api/wallpaper/${wallpaperId}/quote/${selectedQuoteId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ style: { ...selectedQuote.style, bgOpacity: newBgOpacity } }),
                        }).then(() => router.refresh());
                      }}
                      className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <p className="text-xs text-neutral-400">Set to 0 for transparent background</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/wallpaper/${wallpaperId}/quote/${selectedQuoteId}`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                          });
                          if (response.ok) {
                            toast.success("Quote deleted successfully");
                            setSelectedQuote(null);
                            setSelectedQuoteId(null);
                            window.dispatchEvent(new CustomEvent("quoteSelected", { detail: { quoteId: null, quote: null } }));
                            router.refresh();
                          } else {
                            throw new Error("Failed to delete quote");
                          }
                        } catch (error: any) {
                          toast.error(error.message || "Failed to delete quote");
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-red-900/20 border border-red-700/50 rounded-xl text-red-400 font-semibold hover:bg-red-900/30 hover:border-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQuote(null);
                        setSelectedQuoteId(null);
                        window.dispatchEvent(new CustomEvent("quoteSelected", { detail: { quoteId: null, quote: null } }));
                      }}
                      className="flex-1 px-4 py-2 bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all"
                    >
                      Done Editing
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <QuoteGeneratorPanel
                wallpaperId={wallpaperId}
                wallpaperPrompt={initialPrompt}
                wallpaperMood={initialMood}
                wallpaperStyle={initialStyle}
              />
            )}
          </motion.div>
        )}

        {activeTab === "draw" && (
          <motion.div
            key="draw"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl bg-white/5 border border-neutral-700 backdrop-blur-md p-6 space-y-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pencil className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-white">Drawing Tools</h3>
              </div>
              <p className="text-sm text-neutral-400">Draw on your wallpaper with pencil or highlighter</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("setDrawingMode", { detail: { mode: "pencil" } }));
                  }}
                  className="px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Pencil
                </button>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("setDrawingMode", { detail: { mode: "highlighter" } }));
                  }}
                  className="px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2"
                >
                  <Highlighter className="h-4 w-4" />
                  Highlighter
                </button>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("setDrawingMode", { detail: { mode: "eraser" } }));
                  }}
                  className="px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2"
                >
                  <Eraser className="h-4 w-4" />
                  Eraser
                </button>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("setDrawingMode", { detail: { mode: "none" } }));
                  }}
                  className="px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all"
                >
                  None
                </button>
              </div>

              {/* Undo/Redo for Drawing */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("undoDrawing"));
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2"
                >
                  <Undo2 className="h-4 w-4" />
                  Undo
                </button>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("redoDrawing"));
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2"
                >
                  <Redo2 className="h-4 w-4" />
                  Redo
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    defaultValue="#FFFFFF"
                    onChange={(e) => {
                      window.dispatchEvent(new CustomEvent("setDrawColor", { detail: { color: e.target.value } }));
                    }}
                    className="w-16 h-10 rounded-lg border border-neutral-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue="#FFFFFF"
                    onChange={(e) => {
                      window.dispatchEvent(new CustomEvent("setDrawColor", { detail: { color: e.target.value } }));
                    }}
                    placeholder="#FFFFFF"
                    className="flex-1 px-4 py-2 bg-white/5 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">Size</label>
                  <span className="text-sm text-neutral-400">5px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  defaultValue={5}
                  onChange={(e) => {
                    window.dispatchEvent(new CustomEvent("setDrawSize", { detail: { size: Number(e.target.value) } }));
                  }}
                  className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "ai" && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl bg-white/5 border border-neutral-700 backdrop-blur-md p-6 space-y-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-white">AI Restyle</h3>
              </div>
              <p className="text-sm text-neutral-400">
                Transform your wallpaper with AI-powered style modifications
              </p>
            </div>

            {/* Undo/Redo buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0 || loadingHistory || restyling}
                className="flex-1 px-4 py-2 bg-white/5 border border-neutral-700 rounded-lg text-white text-sm font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo2 className="h-4 w-4" />
                Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1 || loadingHistory || restyling}
                className="flex-1 px-4 py-2 bg-white/5 border border-neutral-700 rounded-lg text-white text-sm font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Redo2 className="h-4 w-4" />
                Redo
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="restyle-prompt" className="block text-sm font-semibold text-white">
                Instruction
              </label>
              <textarea
                id="restyle-prompt"
                placeholder="e.g., make it night, add neon glow, make it sunset"
                value={restylePrompt}
                onChange={(e) => setRestylePrompt(e.target.value)}
                disabled={restyling}
                className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none min-h-[100px] backdrop-blur-md transition-all"
              />
            </div>
            <button
              onClick={handleRestyle}
              disabled={restyling}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-700 to-neutral-700 text-white font-semibold rounded-xl hover:from-red-600 hover:to-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {restyling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Restyling...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Apply Restyle
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
