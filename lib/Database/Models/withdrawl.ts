// models/Withdrawal.ts
import mongoose from "mongoose";

const WithdrawalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  beneficiaryId: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "transferred", "failed"],
    default: "pending"
  },
  remarks: String,
  transferId: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Withdrawal || mongoose.model("Withdrawal", WithdrawalSchema);
