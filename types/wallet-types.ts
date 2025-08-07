export interface Transaction {
  createdAt: string;
  id: string;
  userId: string;
  type: "buy" | "sell" | "deposit" | "withdraw";
  symbol?: string;
  amount: number;
  date: string;
}


export interface AnalyticsData {
  investmentDistribution: { name: string; value: number }[];
  balanceTrend: { date: string; balance: number }[];
  dailyPLHistory: { date: string; pnl: number }[];
}

export type WalletContextType = {
  isLoading: boolean;
  filters: { dateRange: { from?: Date; to?: Date }; type: string; symbol: string };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  verifyPin: (pin: string) => Promise<boolean>;
  addMoney: (amount: number) => Promise<boolean>;
  withdraw: (amount: number, pin: string) => Promise<boolean>;

  // ✅ Holdings and Transactions
  analytics: AnalyticsData | null
  transactions: Transaction[];

  fetchHoldingsAnalytics: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
};
// types/wallet-types.ts (or wherever you store shared types)
export interface Order {
  _id: string;
  userId: string;
  symbol: string;
  type: "buy" | "sell"; // market direction
  orderType: "market" | "limit" | "stop"; // order strategy
  quantity: number;
  price?: number;        // For limit orders
  stopPrice?: number;    // For stop orders
  targetPrice?: number;  // For take-profit or conditional orders
  status: "pending" | "cancelled" |"completed"
  filledQuantity: number;
  averagePrice?: number;
  createdAt: string;
  updatedAt: string;
  feeBreakdown?: {
    brokerage: number;
    convenience: number;
  };
  validTill?: string;
}
