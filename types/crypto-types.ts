
export interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  change24h?: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  rank?: number;
  dominance?: number;
}