import { Types } from "mongoose";

export interface IWallpaper {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId | string;
  prompt: string;
  enhancedPrompt?: string;
  title?: string;
  description?: string;
  isPublic?: boolean;
  mood?: string;
  style?: string;
  aspect: string;
  imageUrl: string;
  cloudinaryPublicId?: string;
  referenceImageUrl?: string; // For image-to-image generation
  edited: boolean;
  tags?: string[];
  category?: string;
  likes?: Types.ObjectId[];
  favorites?: Types.ObjectId[];
  views?: number;
  downloads?: number;
  comments?: Array<{
    userId: Types.ObjectId;
    text: string;
    createdAt: Date;
  }>;
  collections?: Types.ObjectId[];
  history?: Array<{
    imageUrl: string;
    prompt: string;
    timestamp: Date;
  }>;
  quotes?: Array<{
    text: string;
    author?: string;
    position: { x: number; y: number };
    style: {
      fontFamily: string;
      fontSize: number;
      color: string;
      opacity: number;
    };
  }>;
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    sharpness?: number;
    warmth?: number;
  };
  quality?: "standard" | "premium" | "ultra";
  aiModel?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WallpaperFilters = IWallpaper["filters"];

