import mongoose, { Schema, Document, model, models } from "mongoose";

export interface Alert {
  id: string;
  type: "above" | "below";
  price: number;
  isActive: boolean;
  createdAt: Date;
  toggledAt: string | Date;
}

export interface StockItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt: Date;
  alerts?: Alert[];
}

export interface IWatchlist extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
  stocks: StockItem[];
}

const WatchlistSchema = new Schema<IWatchlist>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  stocks: [
    {
      symbol: { type: String, required: true },
      name: { type: String },
      price: { type: Number },
      change: { type: Number },
      changePercent: { type: Number },
      addedAt: { type: Date, default: Date.now },
      alerts: [
        {
          id: String,
          type: { type: String, enum: ["above", "below"] },
          price: Number,
          isActive: Boolean,
          createdAt: Date,
          toggledAt: Date,
        },
      ],
    },
  ],
});

export const Watchlist =
  models.Watchlist || model<IWatchlist>("Watchlist", WatchlistSchema);
