import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Schema.Types.ObjectId | string;
  symbol?: string;
  type: 'buy' | 'sell' | 'credit' | 'debit';
  amount: number;
  price?: number;
  quantity?: number;
  status?: 'pending' | 'completed' | 'failed';
  executedAt?: Date;
  source?: 'wallet' | 'bank' | 'external';
  orderId?: string;
  transferId?: string; // Added: for Cashfree/Razorpay payout references
  remarks?: string;    // Added: optional user/admin note
  feeBreakdown?: {
    brokerage?: number;
    convenience?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symbol: { type: String },
    type: {
      type: String,
      enum: ['buy', 'sell', 'credit', 'debit'],
      required: true,
    },
    amount: { type: Number, required: true },
    price: { type: Number },
    quantity: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ['wallet', 'bank', 'external'],
      default: 'wallet',
    },
    orderId: { type: String },
    transferId: { type: String }, // <-- NEW
    remarks: { type: String },    // <-- NEW
    feeBreakdown: {
      brokerage: { type: Number, default: 0 },
      convenience: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Optimized index for recent user transactions
TransactionSchema.index({ userId: 1, createdAt: -1 });

const TransactionModel =
  models.Transaction || model<ITransaction>('Transaction', TransactionSchema);

export default TransactionModel;
