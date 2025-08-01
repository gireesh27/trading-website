import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IOrder extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  symbol: string;
  quantity: number;
  price?: number;
  type: "buy" | "sell";
  status: "completed" | "pending" | "cancelled";
  orderType: "market" | "limit" | "stop";
  feeBreakdown: {
    brokerage: number;
    convenience: number;
  };
  holdingPeriod: number;
  profitOrLoss: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number }, // Optional for market orders
    type: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },
    orderType: {
      type: String,
      enum: ["market", "limit", "stop"],
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "cancelled"],
      default: "pending",
    },
    feeBreakdown: {
      brokerage: { type: Number, default: 0 },
      convenience: { type: Number, default: 0 },
    },
    holdingPeriod: { type: Number, default: 0 },
    profitOrLoss: { type: Number, default: 0 },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export const Order = models.Order || model<IOrder>("Order", OrderSchema);
