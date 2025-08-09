import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId | string;
  symbol?: string;
  sector?: string;
  type: 'buy' | 'sell' | 'credit' | 'debit';
  amount: number;
  price?: number;
  quantity?: number;
  status?: 'pending' | 'completed' | 'failed';
  executedAt?: Date;
  source?: 'wallet' | 'bank' | 'external';
  orderId?: string;
  transferId?: string; 
  remarks?: string;
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
    symbol: {
      type: String,
    },
    sector: {
      type: String,
    },
    type: {
      type: String,
      enum: ['buy', 'sell', 'credit', 'debit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
    },
    quantity: {
      type: Number,
    },
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
    orderId: {
      type: String,
    },
    transferId: {
      type: String,
      unique: true,
      sparse: true, // only indexes when present
    },
    remarks: {
      type: String,
    },
    feeBreakdown: {
      brokerage: {
        type: Number,
        default: 0,
      },
      convenience: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index to optimize query: recent transactions per user
TransactionSchema.index({ userId: 1, createdAt: -1 });

// Optional: Virtual for total fees
TransactionSchema.virtual('totalFee').get(function (this: ITransaction) {
  return (this.feeBreakdown?.brokerage || 0) + (this.feeBreakdown?.convenience || 0);
});

const TransactionModel =
  models.Transaction || model<ITransaction>('Transaction', TransactionSchema);

export default TransactionModel;
