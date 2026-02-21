import mongoose, { Schema, Document, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  emailPasswordHash?: string;
  walletPasswordHash?: string;
  isOAuth?: boolean;
  isVerified?: boolean;
  walletBalance?: number;
  razorpayContactId?: string;
  razorpayFundAccountId?: string;
  validateEmailPassword?: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailPasswordHash: { type: String },
    walletPasswordHash: { type: String },
    isOAuth: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    walletBalance: { type: Number },
    razorpayContactId: { type: String },
    razorpayFundAccountId: { type: String },
  },
  { timestamps: true }
);

// Validate email password
UserSchema.methods.validateEmailPassword = async function (password: string) {
  if (!this.emailPasswordHash) return false;
  return bcrypt.compare(password, this.emailPasswordHash);
};

// Pre-save hook to hash email password if modified
UserSchema.pre("save", async function (next) {
  if (this.isModified("emailPasswordHash") && this.emailPasswordHash) {
    const salt = await bcrypt.genSalt(10);
    this.emailPasswordHash = await bcrypt.hash(this.emailPasswordHash, salt);
  }
  next();
});

export const User = models.User || model<IUser>("User", UserSchema);
