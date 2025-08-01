// models/Wallet.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IWallet extends Document {
  userId: string;
  walletBalance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: String, required: true, unique: true },
    walletBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Wallet =
  mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", WalletSchema);
