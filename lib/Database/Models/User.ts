// lib/Database/Models/User.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  isVerified?: boolean;
  isOAuth?: boolean;
  availableCash: number; // ✅ Properly typed as number
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function (this: IUser) {
      return !this.isOAuth;
    },
    minlength: [6, "Password must be at least 6 characters long"],
    trim: true,
  },
  isVerified: { type: Boolean, default: false },
  isOAuth: { type: Boolean, default: false },
  availableCash: { type: Number, default: 100000 }, // ✅ Start with ₹1L
});

export const User = models.User || model<IUser>("User", UserSchema);
