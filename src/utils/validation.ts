import { z } from "zod";

export const generateWallpaperSchema = z.object({
  prompt: z
    .string()
    .min(3, "Prompt must be at least 3 characters")
    .max(500, "Prompt must be less than 500 characters")
    .trim(),
  mood: z.string().optional(),
  style: z.string().optional(),
  aspect: z.enum(["16:9", "9:16", "21:9"], {
    message: "Aspect ratio is required",
  }),
});

export const editWallpaperSchema = z.object({
  wallpaperId: z.string().min(1, "Wallpaper ID is required"),
  prompt: z
    .string()
    .min(3, "Prompt must be at least 3 characters")
    .max(500, "Prompt must be less than 500 characters")
    .trim(),
  instruction: z
    .string()
    .min(3, "Instruction must be at least 3 characters")
    .max(200, "Instruction must be less than 200 characters")
    .trim(),
});

export const saveWallpaperSchema = z.object({
  wallpaperId: z.string().min(1, "Wallpaper ID is required"),
});

export const applyFiltersSchema = z.object({
  wallpaperId: z.string().min(1, "Wallpaper ID is required"),
  filters: z.object({
    brightness: z.number().min(-100).max(100).optional(),
    contrast: z.number().min(-100).max(100).optional(),
    saturation: z.number().min(-100).max(100).optional(),
    blur: z.number().min(0).max(100).optional(),
    sharpness: z.number().min(-100).max(100).optional(),
    warmth: z.number().min(-100).max(100).optional(),
  }),
});

export type GenerateWallpaperInput = z.infer<typeof generateWallpaperSchema>;
export type EditWallpaperInput = z.infer<typeof editWallpaperSchema>;
export type SaveWallpaperInput = z.infer<typeof saveWallpaperSchema>;
export type ApplyFiltersInput = z.infer<typeof applyFiltersSchema>;

