import mongoose, { Schema, Document } from "mongoose";

export interface IDailyPrice extends Document {
  symbol: string;
  date: Date;
  price: number;
}

const DailyPriceSchema = new Schema<IDailyPrice>({
  symbol: { type: String, required: true },
  date: { type: Date, required: true },
  price: { type: Number, required: true },
});

export const DailyPrice =
  mongoose.models.DailyPrice || mongoose.model<IDailyPrice>("DailyPrice", DailyPriceSchema);
