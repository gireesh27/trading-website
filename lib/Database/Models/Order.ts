import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  quantity: number;
  price?: number;
  type: "buy" | "sell";
  status: "completed" | "pending" | "cancelled";
  orderType: "market" | "limit" | "stop";
  timestamp: Date;
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: Number,
  type: { type: String, enum: ["buy", "sell"], required: true },
  orderType: { type: String, enum: ["market", "limit", "stop"], required: true },
  status: { type: String, enum: ["completed", "pending", "cancelled"], default: "completed" },
  timestamp: { type: Date, default: Date.now },
});

export const Order = models.Order || model<IOrder>("Order", OrderSchema);
