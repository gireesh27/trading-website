import mongoose from "mongoose";

const HoldingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true }, // e.g., AAPL, TSLA
  quantity: { type: Number, required: true }, // total shares owned
  avgPrice: { type: Number, required: true }, // weighted average cost
  totalInvested: { type: Number, required: true }, // quantity * avgPrice
}, { timestamps: true });

export const Holding = mongoose.models.Holding || mongoose.model("Holding", HoldingSchema);
