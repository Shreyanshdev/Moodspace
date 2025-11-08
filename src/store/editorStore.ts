import { create } from "zustand";

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  opacity: number;
  rotation: number;
  fontWeight: "normal" | "bold" | "lighter";
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  textDecoration: "none" | "underline" | "line-through";
  strokeColor?: string;
  strokeWidth?: number;
}

interface EditorState {
  // Existing filter properties
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sharpness: number;
  warmth: number;
  
  // Text overlay properties
  textOverlays: TextOverlay[];
  selectedTextId: string | null;
  
  // Filter setters
  setBrightness: (value: number) => void;
  setContrast: (value: number) => void;
  setSaturation: (value: number) => void;
  setBlur: (value: number) => void;
  setSharpness: (value: number) => void;
  setWarmth: (value: number) => void;
  reset: () => void;
  loadFilters: (filters: { brightness?: number; contrast?: number; saturation?: number; blur?: number; sharpness?: number; warmth?: number }) => void;
  
  // Text overlay methods
  addTextOverlay: (overlay: Omit<TextOverlay, "id">) => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  removeTextOverlay: (id: string) => void;
  selectTextOverlay: (id: string | null) => void;
  clearAllText: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // Filter defaults
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  sharpness: 0,
  warmth: 0,
  
  // Text overlay defaults
  textOverlays: [],
  selectedTextId: null,
  
  // Filter setters
  setBrightness: (value) => set({ brightness: value }),
  setContrast: (value) => set({ contrast: value }),
  setSaturation: (value) => set({ saturation: value }),
  setBlur: (value) => set({ blur: value }),
  setSharpness: (value) => set({ sharpness: value }),
  setWarmth: (value) => set({ warmth: value }),
  reset: () =>
    set({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      sharpness: 0,
      warmth: 0,
    }),
  loadFilters: (filters) =>
    set({
      brightness: filters.brightness ?? 0,
      contrast: filters.contrast ?? 0,
      saturation: filters.saturation ?? 0,
      blur: filters.blur ?? 0,
      sharpness: filters.sharpness ?? 0,
      warmth: filters.warmth ?? 0,
    }),
  
  // Text overlay methods
  addTextOverlay: (overlay) =>
    set((state) => ({
      textOverlays: [
        ...state.textOverlays,
        { ...overlay, id: `text-${Date.now()}-${Math.random()}` },
      ],
    })),
  updateTextOverlay: (id, updates) =>
    set((state) => ({
      textOverlays: state.textOverlays.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      ),
    })),
  removeTextOverlay: (id) =>
    set((state) => ({
      textOverlays: state.textOverlays.filter((overlay) => overlay.id !== id),
      selectedTextId: state.selectedTextId === id ? null : state.selectedTextId,
    })),
  selectTextOverlay: (id) => set({ selectedTextId: id }),
  clearAllText: () => set({ textOverlays: [], selectedTextId: null }),
}));

// ✅ Text style presets
export const TEXT_STYLE_PRESETS = {
  modern: {
    fontFamily: "Arial",
    fontSize: 64,
    fontWeight: "bold" as const,
    fontStyle: "normal" as const,
    color: "#FFFFFF",
    backgroundColor: "#000000",
    opacity: 0.9,
    textAlign: "center" as const,
    strokeColor: "#FFFFFF",
    strokeWidth: 2,
  },
  elegant: {
    fontFamily: "Georgia",
    fontSize: 56,
    fontWeight: "normal" as const,
    fontStyle: "italic" as const,
    color: "#F5F5DC",
    backgroundColor: undefined,
    opacity: 1,
    textAlign: "center" as const,
    strokeColor: "#8B7355",
    strokeWidth: 1,
  },
  bold: {
    fontFamily: "Impact",
    fontSize: 72,
    fontWeight: "bold" as const,
    fontStyle: "normal" as const,
    color: "#FF0000",
    backgroundColor: "#FFFF00",
    opacity: 1,
    textAlign: "center" as const,
    strokeColor: "#000000",
    strokeWidth: 3,
  },
  minimal: {
    fontFamily: "Helvetica",
    fontSize: 48,
    fontWeight: "lighter" as const,
    fontStyle: "normal" as const,
    color: "#000000",
    backgroundColor: undefined,
    opacity: 0.8,
    textAlign: "left" as const,
    strokeColor: undefined,
    strokeWidth: undefined,
  },
  neon: {
    fontFamily: "Arial",
    fontSize: 60,
    fontWeight: "bold" as const,
    fontStyle: "normal" as const,
    color: "#00FFFF",
    backgroundColor: "#000000",
    opacity: 1,
    textAlign: "center" as const,
    strokeColor: "#FF00FF",
    strokeWidth: 2,
  },
  vintage: {
    fontFamily: "Times New Roman",
    fontSize: 52,
    fontWeight: "normal" as const,
    fontStyle: "normal" as const,
    color: "#8B4513",
    backgroundColor: "#F5DEB3",
    opacity: 0.95,
    textAlign: "center" as const,
    strokeColor: "#654321",
    strokeWidth: 1,
  },
  futuristic: {
    fontFamily: "Courier New",
    fontSize: 58,
    fontWeight: "bold" as const,
    fontStyle: "normal" as const,
    color: "#00FF00",
    backgroundColor: "#000000",
    opacity: 1,
    textAlign: "center" as const,
    strokeColor: "#00FFFF",
    strokeWidth: 2,
  },
  artistic: {
    fontFamily: "Palatino",
    fontSize: 54,
    fontWeight: "normal" as const,
    fontStyle: "italic" as const,
    color: "#FF6B6B",
    backgroundColor: undefined,
    opacity: 0.9,
    textAlign: "center" as const,
    strokeColor: "#FFFFFF",
    strokeWidth: 1,
  },
};

