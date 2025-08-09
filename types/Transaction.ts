export interface Transaction {
  id: string; // derived from _id
  userId: string;
  symbol?: string;
  sector?: string;
  type: 'buy' | 'sell' | 'credit' | 'debit';
  amount: number;
  price?: number;
  quantity?: number;
  status?: 'pending' | 'completed' | 'failed';
  executedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  source?: 'wallet' | 'bank' | 'external';
  orderId?: string;
  feeBreakdown?: {
    brokerage?: number;
    convenience?: number;
  };
}
