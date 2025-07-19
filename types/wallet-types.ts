export interface WalletOverview {
  currentBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalInvested: number;
  availableCash: number;
  dailyPL: { amount: number; percent: number };
  weeklyPL: { amount: number; percent: number };
  allTimePL: { amount: number; percent: number };
}

export interface Transaction {
  id: string;
  date: string;
  type: 'Buy' | 'Sell' | 'Deposit' | 'Withdraw' | 'Fee' | 'Dividend';
  symbol?: string;
  quantity?: number;
  price?: number;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
}

export interface AnalyticsData {
  investmentDistribution: { name: string; value: number }[];
  balanceTrend: { date: string; balance: number }[];
  dailyPLHistory: { date: string; pnl: number }[];
}

export interface WalletContextType {
  overview: WalletOverview | null;
  transactions: Transaction[];
  analytics: AnalyticsData | null;
  isLoading: boolean;
  filters: {
    dateRange: { from?: Date; to?: Date };
    type: string;
    symbol: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  fetchWalletData: () => void;
}