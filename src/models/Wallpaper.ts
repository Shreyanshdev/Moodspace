import mongoose, { Schema, Model } from "mongoose";
import { IWallpaper } from "@/types/wallpaper";

const WallpaperSchema = new Schema<IWallpaper>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    prompt: {
      type: String,
      required: true,
    },
    enhancedPrompt: {
      type: String,
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    mood: {
      type: String,
    },
    style: {
      type: String,
    },
    aspect: {
      type: String,
      required: true,
      enum: ["16:9", "9:16", "21:9"],
    },
    imageUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
    },
    referenceImageUrl: {
      type: String,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    tags: [{
      type: String,
    }],
    category: {
      type: String,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    favorites: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    comments: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    collections: [{
      type: Schema.Types.ObjectId,
      ref: "Collection",
    }],
    history: [{
      imageUrl: String,
      prompt: String,
      timestamp: Date,
    }],
    quotes: [{
      text: String,
      author: String,
      position: {
        x: Number,
        y: Number,
      },
      style: {
        fontFamily: String,
        fontSize: Number,
        color: String,
        opacity: Number,
      },
    }],
    filters: {
      brightness: { type: Number, default: 0 },
      contrast: { type: Number, default: 0 },
      saturation: { type: Number, default: 0 },
      blur: { type: Number, default: 0 },
      sharpness: { type: Number, default: 0 },
      warmth: { type: Number, default: 0 },
    },
    quality: {
      type: String,
      enum: ["standard", "premium", "ultra"],
      default: "standard",
    },
    aiModel: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

WallpaperSchema.index({ userId: 1 });
WallpaperSchema.index({ createdAt: -1 });
WallpaperSchema.index({ isPublic: 1, createdAt: -1 });
WallpaperSchema.index({ tags: 1 });
WallpaperSchema.index({ category: 1 });
WallpaperSchema.index({ style: 1 });
WallpaperSchema.index({ mood: 1 });
WallpaperSchema.index({ "likes": 1 });
WallpaperSchema.index({ "favorites": 1 });

const Wallpaper: Model<IWallpaper> =
  mongoose.models.Wallpaper ||
  mongoose.model<IWallpaper>("Wallpaper", WallpaperSchema);

export default Wallpaper;

