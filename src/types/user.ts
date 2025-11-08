import { Types } from "mongoose";

export interface IUser {
  _id?: Types.ObjectId;
  userId: string;
  email: string;
  name: string;
  image?: string;
  credits: number;
  wallpapers: Types.ObjectId[];
  subscriptionTier?: "free" | "pro" | "premium";
  subscriptionExpiresAt?: Date;
  lastCreditReset?: Date;
  collections?: Array<{
    _id?: Types.ObjectId;
    name: string;
    description?: string;
    wallpapers: Types.ObjectId[];
    createdAt: Date;
  }>;
  favorites?: Types.ObjectId[];
  downloadHistory?: Array<{
    wallpaperId: Types.ObjectId;
    downloadedAt: Date;
  }>;
  apiKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

