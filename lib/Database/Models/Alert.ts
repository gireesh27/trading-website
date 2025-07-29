import mongoose, { Schema, Document, models, model } from "mongoose";

export interface Alert extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  type: "price" | "percent_change" | "volume" | "news";
  value?: number;
  condition?: "above" | "below";
  keywords?: string[];
  status: "active" | "triggered" | "inactive";
  triggeredAt?: Date;
  createdAt: Date;
}

const AlertSchema = new Schema<Alert>(
  {
     userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    type: { type: String, enum: ["price", "percent_change", "volume", "news"], required: true },
    value: { type: Number }, // only for non-news
    condition: { type: String, enum: ["above", "below"] },
    keywords: [String], // only for news
    status: { type: String, enum: ["active", "triggered", "inactive"], default: "active" },
    triggeredAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AlertModel = models.Alert || model<Alert>("Alert", AlertSchema);
