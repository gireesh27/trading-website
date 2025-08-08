import mongoose, { Schema, Document } from "mongoose";

export interface IDailyPrice extends Document {
  symbol: string;
  date: Date;
  close: number;
}

export const DailyPriceSchema = new Schema<IDailyPrice>({
  symbol: { type: String, required: true },
  date: { type: Date, required: true },
  close: { type: Number, required: true },
});

export const DailyPrice =
  mongoose.models.DailyPrice || mongoose.model<IDailyPrice>("DailyPrice", DailyPriceSchema);
