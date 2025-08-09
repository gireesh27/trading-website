import mongoose, { Schema, Document } from "mongoose";

export interface IDailyPrice extends Document {
  symbol: string;
  sector?: string;
  date: Date;
  close: number;
  change?: number;
  changePercent?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  volume?: number;
  marketCap?: number;
}

export const DailyPriceSchema = new Schema<IDailyPrice>({
  symbol: { type: String, required: true },
  sector: { type: String, required: false },
  date: { type: Date, required: true },
  close: { type: Number, required: true },
  change: { type: Number },
  changePercent: { type: Number },
  high: { type: Number },
  low: { type: Number },
  open: { type: Number },
  previousClose: { type: Number },
  volume: { type: Number },
  marketCap: { type: Number },
});

export const DailyPrice =
  mongoose.models.DailyPrice || mongoose.model<IDailyPrice>("DailyPrice", DailyPriceSchema);
