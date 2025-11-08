"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useEditorStore } from "@/store/editorStore";
import { Download, Loader2, Save, Globe, ImageIcon, X, Pencil, Highlighter, Eraser, Undo2, Redo2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface EditorCanvasProps {
  imageUrl: string;
  wallpaperId: string;
  quotes?: Array<{
    text: string;
    author?: string;
    position: { x: number; y: number };
    style: {
      fontFamily: string;
      fontSize: number;
      color: string;
      opacity: number;
      fontWeight?: string;
      fontStyle?: string;
      bgOpacity?: number;
    };
  }>;
}

export function EditorCanvas({ imageUrl, wallpaperId, quotes = [] }: EditorCanvasProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [proxiedImageUrl, setProxiedImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [title, setTitle] = useState("");
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [isDraggingQuote, setIsDraggingQuote] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [drawingMode, setDrawingMode] = useState<"none" | "pencil" | "highlighter" | "eraser">("none");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#FFFFFF");
  const [drawSize, setDrawSize] = useState(5);
  const [showPreview, setShowPreview] = useState(false);
  const lastDrawPoint = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingHistory = useRef<ImageData[]>([]);
  const drawingHistoryIndex = useRef<number>(-1);
  const baseImageData = useRef<ImageData | null>(null);
  
  // Debug: Log quotes to see if they're being passed
  useEffect(() => {
    if (quotes && quotes.length > 0) {
      console.log("Quotes to render:", quotes);
    } else {
      console.log("No quotes found");
    }
  }, [quotes]);
  const {
    brightness,
    contrast,
    saturation,
    blur,
    sharpness,
    warmth,
    textOverlays,
  } = useEditorStore();

  // Create proxied URL
  useEffect(() => {
    if (imageUrl) {
      const encodedUrl = encodeURIComponent(imageUrl);
      setProxiedImageUrl(`/api/image-proxy?url=${encodedUrl}`);
    }
  }, [imageUrl]);

  // Debounce filter updates for performance
  const filterUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Save filters to database when changed
  const saveFilters = async (filters: { brightness: number; contrast: number; saturation: number; blur: number; sharpness: number; warmth: number }) => {
    if (filterUpdateTimeoutRef.current) {
      clearTimeout(filterUpdateTimeoutRef.current);
    }
    
    filterUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/wallpaper/${wallpaperId}/filters`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        });
      } catch (error) {
        console.error("Error saving filters:", error);
      }
    }, 500); // Debounce by 500ms
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !proxiedImageUrl) return;

    const ctx = canvas.getContext("2d", { 
      willReadFrequently: false, // Changed to false for better performance
      colorSpace: "srgb"
    });
    if (!ctx) return;

    img.onerror = () => {
      console.error("Failed to load image");
      toast.error("Failed to load image. Please try again.");
      setLoading(false);
    };

    img.onload = () => {
      try {
      canvas.width = img.width;
      canvas.height = img.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // ✅ Draw image first without filters
      ctx.drawImage(img, 0, 0);

        // Save base image data for eraser and undo/redo
        baseImageData.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        drawingHistory.current = [baseImageData.current];
        drawingHistoryIndex.current = 0;

        // ✅ Apply filters only if values are not default
        if (brightness !== 0 || contrast !== 0 || saturation !== 0 || blur !== 0 || sharpness !== 0 || warmth !== 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply brightness, contrast, saturation, warmth
      for (let i = 0; i < data.length; i += 4) {
        // Brightness
            if (brightness !== 0) {
        data[i] = Math.min(255, Math.max(0, data[i] + brightness * 2.55));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness * 2.55));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness * 2.55));
            }

        // Contrast
            if (contrast !== 0) {
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
            }

        // Saturation
            if (saturation !== 0) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              const satFactor = (saturation + 100) / 100; // Convert -100 to 100 range to 0 to 2
        data[i] = Math.min(255, Math.max(0, gray + satFactor * (data[i] - gray)));
        data[i + 1] = Math.min(255, Math.max(0, gray + satFactor * (data[i + 1] - gray)));
        data[i + 2] = Math.min(255, Math.max(0, gray + satFactor * (data[i + 2] - gray)));
            }

        // Warmth
            if (warmth !== 0) {
        if (warmth > 0) {
          data[i] = Math.min(255, data[i] + warmth * 0.5);
          data[i + 2] = Math.max(0, data[i + 2] - warmth * 0.3);
              } else {
          data[i] = Math.max(0, data[i] + warmth * 0.5);
          data[i + 2] = Math.min(255, data[i + 2] - warmth * 0.3);
              }
        }
      }

      ctx.putImageData(imageData, 0, 0);
        }

        // Apply blur
      if (blur > 0) {
        ctx.filter = `blur(${blur / 10}px)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = "none";
      }

        // ✅ Render text overlays
        textOverlays.forEach((overlay) => {
          ctx.save();
          
          // Set text properties
          ctx.font = `${overlay.fontStyle} ${overlay.fontWeight} ${overlay.fontSize}px ${overlay.fontFamily}`;
          ctx.fillStyle = overlay.color;
          ctx.globalAlpha = overlay.opacity;
          ctx.textAlign = overlay.textAlign;
          ctx.textBaseline = "top";
          
          // Apply rotation
          ctx.translate(overlay.x, overlay.y);
          ctx.rotate((overlay.rotation * Math.PI) / 180);
          
          // Draw background if specified
          if (overlay.backgroundColor) {
            const metrics = ctx.measureText(overlay.text);
            const textWidth = metrics.width;
            const textHeight = overlay.fontSize;
            ctx.fillStyle = overlay.backgroundColor;
            ctx.fillRect(-textWidth / 2, 0, textWidth, textHeight);
          }
          
          // Draw stroke if specified
          if (overlay.strokeColor && overlay.strokeWidth) {
            ctx.strokeStyle = overlay.strokeColor;
            ctx.lineWidth = overlay.strokeWidth;
            ctx.strokeText(overlay.text, 0, 0);
          }
          
          // Draw text
          ctx.fillStyle = overlay.color;
          ctx.fillText(overlay.text, 0, 0);
          
          // Apply text decoration
          if (overlay.textDecoration === "underline") {
            const metrics = ctx.measureText(overlay.text);
            ctx.beginPath();
            ctx.moveTo(0, overlay.fontSize);
            ctx.lineTo(metrics.width, overlay.fontSize);
            ctx.stroke();
          }
          
          ctx.restore();
        });

        // ✅ Render quotes from wallpaper
        if (quotes && quotes.length > 0) {
          console.log("Rendering quotes:", quotes.length);
        }
        quotes.forEach((quote) => {
          if (!quote || !quote.text) {
            console.warn("Invalid quote:", quote);
            return;
          }
          
          ctx.save();
          
          // Calculate position (percentage to pixels)
          const x = (quote.position?.x || 50) / 100 * canvas.width;
          const y = (quote.position?.y || 40) / 100 * canvas.height;
          
          // Set text properties
          const fontSize = quote.style.fontSize || 48;
          const fontFamily = quote.style.fontFamily || "serif";
          const fontWeight = quote.style.fontWeight || "bold";
          const fontStyle = quote.style.fontStyle || "normal";
          
          ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          // Draw quote text with word wrapping
          const maxWidth = canvas.width * 0.7; // 70% of canvas width
          const words = quote.text.split(" ");
          const lines: string[] = [];
          let currentLine = "";
          
          // Calculate line breaks
          for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + (currentLine ? " " : "") + words[i];
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = words[i];
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) {
            lines.push(currentLine);
          }
          
          // Calculate total height for background
          const lineHeight = fontSize * 1.3;
          const totalHeight = lines.length * lineHeight + (quote.author ? lineHeight * 0.8 : 0);
          const padding = fontSize * 0.5;
          const bgWidth = Math.max(...lines.map(line => ctx.measureText(line).width)) + padding * 2;
          const bgHeight = totalHeight + padding * 2;
          
          // Draw background with shadow for better visibility (use bgOpacity from style if available)
          const bgOpacity = quote.style?.bgOpacity !== undefined ? quote.style.bgOpacity : 0.6;
          if (bgOpacity > 0) {
            ctx.globalAlpha = bgOpacity;
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight);
          }
          
          // Reset shadow
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          // Draw quote text
          ctx.globalAlpha = quote.style.opacity || 0.95;
          ctx.fillStyle = quote.style.color || "#FFFFFF";
          
          let lineY = y - (lines.length - 1) * lineHeight / 2;
          lines.forEach((line) => {
            ctx.fillText(line, x, lineY);
            lineY += lineHeight;
          });
          
          // Draw author if provided
          if (quote.author) {
            ctx.font = `${fontSize * 0.6}px ${fontFamily}`;
            ctx.globalAlpha = (quote.style.opacity || 0.95) * 0.9;
            ctx.fillText(`— ${quote.author}`, x, lineY);
          }
          
          ctx.restore();
        });

        setLoading(false);
      } catch (error: any) {
        console.error("Error processing image:", error);
        toast.error("Failed to process image. Please try again.");
      setLoading(false);
      }
    };

    // ✅ Ensure image loads with proper attributes
    img.crossOrigin = "anonymous";
    img.src = proxiedImageUrl;
    
    // Save filters when they change
    saveFilters({ brightness, contrast, saturation, blur, sharpness, warmth });
    
    return () => {
      if (filterUpdateTimeoutRef.current) {
        clearTimeout(filterUpdateTimeoutRef.current);
      }
    };
  }, [proxiedImageUrl, brightness, contrast, saturation, blur, sharpness, warmth, textOverlays, quotes, wallpaperId]);

  const handleDownload = async () => {
    if (!session?.user) {
      toast.error("Please sign in to download");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wallpaper-${wallpaperId}-edited.png`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Wallpaper downloaded!");
      }, "image/png");
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

    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          
          try {
            const response = await fetch("/api/save-edited", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                wallpaperId,
                imageData: base64data,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Failed to save wallpaper");
            }

            toast.success("Wallpaper saved successfully!");
            // Refresh to show updated image
            window.location.reload();
          } catch (error: any) {
            console.error("Error saving wallpaper:", error);
            toast.error(error.message || "Failed to save wallpaper");
          } finally {
            setSaving(false);
          }
        };
        reader.readAsDataURL(blob);
      }, "image/png");
    } catch (error) {
      console.error("Error saving wallpaper:", error);
      toast.error("Failed to save wallpaper");
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!session?.user) {
      toast.error("Please sign in to publish");
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch(`/api/wallpaper/${wallpaperId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          isPublic: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to publish");
      }

      toast.success("Wallpaper published to public gallery!");
      setShowPublishDialog(false);
      setTitle("");
    } catch (error: any) {
      toast.error(error.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (showPublishDialog || showPreview) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      // Hide controls when dialog is open
      const editorPage = document.getElementById("editor-page");
      if (editorPage) {
        editorPage.style.overflow = "hidden";
      }
    } else {
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
      const editorPage = document.getElementById("editor-page");
      if (editorPage) {
        editorPage.style.overflow = "unset";
      }
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
      const editorPage = document.getElementById("editor-page");
      if (editorPage) {
        editorPage.style.overflow = "unset";
      }
    };
  }, [showPublishDialog, showPreview]);

  // Update preview canvas when shown
  useEffect(() => {
    if (showPreview && previewCanvasRef.current && canvasRef.current) {
      const previewCtx = previewCanvasRef.current.getContext("2d");
      const sourceCanvas = canvasRef.current;
      
      if (previewCtx) {
        const maxWidth = 1920;
        const maxHeight = 1080;
        const scale = Math.min(maxWidth / sourceCanvas.width, maxHeight / sourceCanvas.height, 1);
        
        previewCanvasRef.current.width = sourceCanvas.width * scale;
        previewCanvasRef.current.height = sourceCanvas.height * scale;
        
        previewCtx.drawImage(sourceCanvas, 0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
      }
    }
  }, [showPreview]);

  // Undo/Redo functions for drawing
  const undoDrawing = () => {
    if (drawingHistoryIndex.current <= 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    drawingHistoryIndex.current--;
    const imageData = drawingHistory.current[drawingHistoryIndex.current];
    ctx.putImageData(imageData, 0, 0);
  };

  const redoDrawing = () => {
    if (drawingHistoryIndex.current >= drawingHistory.current.length - 1) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    drawingHistoryIndex.current++;
    const imageData = drawingHistory.current[drawingHistoryIndex.current];
    ctx.putImageData(imageData, 0, 0);
  };

  // Listen for drawing mode changes
  useEffect(() => {
    const handleSetDrawingMode = (e: CustomEvent) => {
      setDrawingMode(e.detail.mode);
    };
    const handleSetDrawColor = (e: CustomEvent) => {
      setDrawColor(e.detail.color);
    };
    const handleSetDrawSize = (e: CustomEvent) => {
      setDrawSize(e.detail.size);
    };
    const handleUndoDrawing = () => {
      undoDrawing();
    };
    const handleRedoDrawing = () => {
      redoDrawing();
    };

    window.addEventListener("setDrawingMode", handleSetDrawingMode as EventListener);
    window.addEventListener("setDrawColor", handleSetDrawColor as EventListener);
    window.addEventListener("setDrawSize", handleSetDrawSize as EventListener);
    window.addEventListener("undoDrawing", handleUndoDrawing as EventListener);
    window.addEventListener("redoDrawing", handleRedoDrawing as EventListener);

    return () => {
      window.removeEventListener("setDrawingMode", handleSetDrawingMode as EventListener);
      window.removeEventListener("setDrawColor", handleSetDrawColor as EventListener);
      window.removeEventListener("setDrawSize", handleSetDrawSize as EventListener);
      window.removeEventListener("undoDrawing", handleUndoDrawing as EventListener);
      window.removeEventListener("redoDrawing", handleRedoDrawing as EventListener);
    };
  }, []);

  // Check if click is within a quote bounds
  const isClickOnQuote = (x: number, y: number, quote: any, canvas: HTMLCanvasElement): boolean => {
    const quoteX = (quote.position?.x || 50) / 100 * canvas.width;
    const quoteY = (quote.position?.y || 40) / 100 * canvas.height;
    const fontSize = quote.style?.fontSize || 48;
    const fontFamily = quote.style?.fontFamily || "serif";
    const fontWeight = quote.style?.fontWeight || "bold";
    const fontStyle = quote.style?.fontStyle || "normal";
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const words = quote.text.split(" ");
    const maxWidth = canvas.width * 0.7;
    const lines: string[] = [];
    let currentLine = "";
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + (currentLine ? " " : "") + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    const lineHeight = fontSize * 1.3;
    const totalHeight = lines.length * lineHeight + (quote.author ? lineHeight * 0.8 : 0);
    const padding = fontSize * 0.5;
    const bgWidth = Math.max(...lines.map(line => ctx.measureText(line).width)) + padding * 2;
    const bgHeight = totalHeight + padding * 2;
    
    return (
      x >= quoteX - bgWidth / 2 &&
      x <= quoteX + bgWidth / 2 &&
      y >= quoteY - bgHeight / 2 &&
      y <= quoteY + bgHeight / 2
    );
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Handle drawing
    if (drawingMode === "pencil" || drawingMode === "highlighter" || drawingMode === "eraser") {
      setIsDrawing(true);
      lastDrawPoint.current = { x: mouseX, y: mouseY };
      // Save state before drawing for undo
      saveDrawingState();
      drawOnCanvas(mouseX, mouseY, mouseX, mouseY);
      return;
    }

    // Check if clicking on a quote
    for (const quote of quotes) {
      const quoteId = (quote as any)._id?.toString() || (quote as any).id;
      if (quoteId && isClickOnQuote(mouseX, mouseY, quote, canvas)) {
        const quoteX = (quote.position?.x || 50) / 100 * canvas.width;
        const quoteY = (quote.position?.y || 40) / 100 * canvas.height;
        
        setSelectedQuoteId(quoteId);
        setIsDraggingQuote(true);
        setDragOffset({
          x: mouseX - quoteX,
          y: mouseY - quoteY,
        });
        // Notify parent component about quote selection
        window.dispatchEvent(new CustomEvent("quoteSelected", { detail: { quoteId, quote } }));
        return;
      }
    }
    
    // Deselect quote if clicking elsewhere
    if (selectedQuoteId) {
      setSelectedQuoteId(null);
      window.dispatchEvent(new CustomEvent("quoteSelected", { detail: { quoteId: null, quote: null } }));
    }
  };

  const saveDrawingState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Remove future history if we're not at the end
    if (drawingHistoryIndex.current < drawingHistory.current.length - 1) {
      drawingHistory.current = drawingHistory.current.slice(0, drawingHistoryIndex.current + 1);
    }
    drawingHistory.current.push(imageData);
    drawingHistoryIndex.current = drawingHistory.current.length - 1;
    // Limit history to 50 states
    if (drawingHistory.current.length > 50) {
      drawingHistory.current.shift();
      drawingHistoryIndex.current--;
    }
  };

  const drawOnCanvas = (x1: number, y1: number, x2: number, y2: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = drawSize;
    
    if (drawingMode === "eraser") {
      // Use destination-out composite for eraser
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1;
    } else if (drawingMode === "highlighter") {
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = drawColor;
    } else {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = drawColor;
    }

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Handle drawing
    if (isDrawing && (drawingMode === "pencil" || drawingMode === "highlighter" || drawingMode === "eraser") && lastDrawPoint.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        drawOnCanvas(lastDrawPoint.current!.x, lastDrawPoint.current!.y, mouseX, mouseY);
        lastDrawPoint.current = { x: mouseX, y: mouseY };
      });
      return;
    }

    // Handle quote dragging
    if (isDraggingQuote && selectedQuoteId) {
      const x = (mouseX / canvas.width) * 100;
      const y = (mouseY / canvas.height) * 100;

      // Update quote position via API (debounced)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(async () => {
        try {
          await fetch(`/api/wallpaper/${wallpaperId}/quote/${selectedQuoteId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              position: { 
                x: Math.max(0, Math.min(100, x)), 
                y: Math.max(0, Math.min(100, y)) 
              } 
            }),
          });
        } catch (error) {
          console.error("Error updating quote position:", error);
        }
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastDrawPoint.current = null;
    }
    
    if (isDraggingQuote) {
      setIsDraggingQuote(false);
      router.refresh();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Add click handler for text positioning
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingQuote) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const { selectedTextId, updateTextOverlay } = useEditorStore.getState();
    if (selectedTextId) {
      updateTextOverlay(selectedTextId, { x, y });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-700 bg-white/5 backdrop-blur-md">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
        )}
        <img
          ref={imageRef}
          src={proxiedImageUrl || imageUrl}
          alt="Wallpaper"
          className="hidden"
        />
        <canvas
          ref={canvasRef}
          className={`h-full w-full object-contain rounded-xl ${
            drawingMode === "pencil" ? "cursor-crosshair" :
            drawingMode === "highlighter" ? "cursor-crosshair" :
            drawingMode === "eraser" ? "cursor-crosshair" :
            isDraggingQuote ? "cursor-grabbing" : 
            quotes.length > 0 ? "cursor-move" : "cursor-crosshair"
          }`}
          style={{ display: loading ? "none" : "block", touchAction: drawingMode !== "none" ? "none" : "auto" }}
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onTouchStart={(e) => {
            if (drawingMode === "pencil" || drawingMode === "highlighter" || drawingMode === "eraser") {
              e.preventDefault();
              const touch = e.touches[0];
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect && canvasRef.current) {
                const scaleX = canvasRef.current.width / rect.width;
                const scaleY = canvasRef.current.height / rect.height;
                const mouseX = (touch.clientX - rect.left) * scaleX;
                const mouseY = (touch.clientY - rect.top) * scaleY;
                setIsDrawing(true);
                lastDrawPoint.current = { x: mouseX, y: mouseY };
                saveDrawingState();
                drawOnCanvas(mouseX, mouseY, mouseX, mouseY);
              }
            }
          }}
          onTouchMove={(e) => {
            if (isDrawing && (drawingMode === "pencil" || drawingMode === "highlighter" || drawingMode === "eraser") && lastDrawPoint.current) {
              e.preventDefault();
              const touch = e.touches[0];
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect && canvasRef.current) {
                const scaleX = canvasRef.current.width / rect.width;
                const scaleY = canvasRef.current.height / rect.height;
                const mouseX = (touch.clientX - rect.left) * scaleX;
                const mouseY = (touch.clientY - rect.top) * scaleY;
                if (animationFrameRef.current) {
                  cancelAnimationFrame(animationFrameRef.current);
                }
                animationFrameRef.current = requestAnimationFrame(() => {
                  drawOnCanvas(lastDrawPoint.current!.x, lastDrawPoint.current!.y, mouseX, mouseY);
                  lastDrawPoint.current = { x: mouseX, y: mouseY };
                });
              }
            }
          }}
          onTouchEnd={(e) => {
            if (isDrawing) {
              e.preventDefault();
              setIsDrawing(false);
              lastDrawPoint.current = null;
            }
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }
          }}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !session?.user}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-red-700 to-neutral-700 text-white font-semibold rounded-xl hover:from-red-600 hover:to-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Edited
            </>
          )}
        </button>
        <button
        onClick={handleDownload}
        disabled={downloading || !session?.user}
          className="flex-1 px-4 py-3 bg-white/5 border border-neutral-700 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
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
        <button
          onClick={() => setShowPublishDialog(true)}
          className="px-4 py-3 bg-white/5 border border-neutral-700 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2"
        >
          <Globe className="h-4 w-4" />
          Publish
        </button>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-3 bg-white/5 border border-neutral-700 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-red-600/50 transition-all flex items-center justify-center gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          Preview
        </button>
      </div>

      {/* Preview Modal - Rendered via Portal */}
      {showPreview && typeof window !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={() => setShowPreview(false)}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 99999
          }}
        >
          <div 
            className="relative max-w-7xl w-full mx-4 h-[90vh] bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 100000 }}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-2 bg-black/70 rounded-lg text-white hover:bg-red-600 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="relative w-full h-full max-w-[1920px] max-h-[1080px]">
                <canvas
                  ref={previewCanvasRef}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Publish Dialog - Rendered via Portal */}
      {showPublishDialog && typeof window !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPublishDialog(false);
            }
          }}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 99999
          }}
        >
          <div 
            className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 100000 }}
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Publish to Public Gallery</h3>
              <p className="text-sm text-neutral-400">
                Share your wallpaper with the community
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your wallpaper"
                  className="w-full px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent backdrop-blur-md transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPublishDialog(false)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-red-600/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-700 to-neutral-700 text-white font-semibold rounded-xl hover:from-red-600 hover:to-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {publishing ? "Publishing..." : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

