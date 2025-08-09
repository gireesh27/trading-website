import mongoose from "mongoose";
import { DailyPriceSchema } from "./DailyPrice";

const HoldingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    sector: { type: String, required: false },
    quantity: { type: Number, required: true },
    avgPrice: { type: Number, required: true },
    totalInvested: { type: Number, required: true },

    buyDate: { type: Date, required: true },
    sellDate: { type: Date }, 
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    // priceHistory subdocuments no longer require userId
    priceHistory: [DailyPriceSchema],
  },
  { timestamps: true }
);

export const Holding =
  mongoose.models.Holding || mongoose.model("Holding", HoldingSchema);
