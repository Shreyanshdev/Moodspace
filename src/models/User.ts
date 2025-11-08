import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/types/user";

const UserSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    credits: {
      type: Number,
      default: 5,
      min: 0,
    },
    wallpapers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Wallpaper",
      },
    ],
    subscriptionTier: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },
    subscriptionExpiresAt: {
      type: Date,
    },
    lastCreditReset: {
      type: Date,
    },
    collections: [{
      name: String,
      description: String,
      wallpapers: [{
        type: Schema.Types.ObjectId,
        ref: "Wallpaper",
      }],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    favorites: [{
      type: Schema.Types.ObjectId,
      ref: "Wallpaper",
    }],
    downloadHistory: [{
      wallpaperId: {
        type: Schema.Types.ObjectId,
        ref: "Wallpaper",
      },
      downloadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    apiKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

