// models/User.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  walletPasswordHash?: string;
  isOAuth?: boolean;
  isVerified?: boolean;
  walletBalance?: number; // ✅ Add this
  razorpayContactId?: string;
  razorpayFundAccountId?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    walletPasswordHash: { type: String },
    isOAuth: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    walletBalance: { type: Number }, // ✅ Added
    razorpayContactId: {type: String},
    razorpayFundAccountId: {type: String},
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
