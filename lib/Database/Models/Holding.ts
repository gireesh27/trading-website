import mongoose from "mongoose";

const DailyPriceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    close: { type: Number, required: true }, // closing price for the day
  },
  { _id: false }
);

const HoldingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    quantity: { type: Number, required: true },
    avgPrice: { type: Number, required: true },
    totalInvested: { type: Number, required: true },

    buyDate: { type: Date, required: true },
    sellDate: { type: Date }, // null until sold
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    // Store historical daily prices for the holding period
    priceHistory: [DailyPriceSchema],
  },
  { timestamps: true }
);

export const Holding =
  mongoose.models.Holding || mongoose.model("Holding", HoldingSchema);
