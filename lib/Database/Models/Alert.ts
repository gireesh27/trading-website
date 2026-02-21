import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    sector: {
      type: String,
    },
    type: {
      type: String,
      enum: ["price", "volume", "percent_change", "news"],
      required: true,
    },
    value: {
      type: Number,
    },
    condition: {
      type: String,
      enum: ["above", "below"],
    },

  },
  { timestamps: true }
);

const AlertModel =
  mongoose.models.Alert || mongoose.model("Alert", AlertSchema);
export default AlertModel;