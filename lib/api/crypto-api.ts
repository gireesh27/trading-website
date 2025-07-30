const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

import { CryptoData } from "@/types/crypto-types";

export interface CryptoQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: string;
  high: number;
  low: number;
  rank?: number;
  dominance?: number;
}

class CryptoAPI {
  async getCryptoQuote(symbol: string): Promise<CryptoQuote> {
    try {
      const coinId = this.getCoinId(symbol);

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&sparkline=false`
      );

      const data = await response.json();
      const coin = data[0];

      return {
        symbol,
        name: this.getCoinName(symbol),
        price: coin.current_price || 0,
        change: coin.price_change_24h || 0,
        changePercent: coin.price_change_percentage_24h || 0,
        volume: coin.total_volume || 0,
        marketCap: coin.market_cap
          ? `${(coin.market_cap / 1_000_000_000).toFixed(2)}B`
          : undefined,
        high: coin.high_24h || 0,
        low: coin.low_24h || 0
      };
    } catch (error) {
      console.error("Error fetching crypto quote:", error);
      throw error;
    }
  }

  async getMultipleCryptoQuotes(): Promise<CryptoData[]> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch crypto data");
    }

    const data = await response.json();

    return data.map((coin: any) => ({
      symbol: `${coin.symbol.toUpperCase()}-USD`,
      name: coin.name,
      price: coin.current_price || 0,
      change: coin.price_change_24h || 0,
      changePercent: coin.price_change_percentage_24h || 0,
      change24h: coin.price_change_24h || 0,
      volume: coin.total_volume || 0,
      marketCap: coin.market_cap || 0,
      high: coin.high_24h || 0,
      low: coin.low_24h || 0,
      rank: coin.market_cap_rank,
      dominance: coin.market_cap_change_percentage_24h_in_currency, // optional, you can remove or compute another way
    }));
  } catch (error) {
    console.error("❌ Error fetching multiple crypto quotes:", error);
    throw error;
  }
}

  private getCoinId(symbol: string): string {
    const cleanedSymbol = symbol.replace("-USD", "").toUpperCase();

    const mapping: { [key: string]: string } = {
      BTC: "bitcoin",
      ETH: "ethereum",
      ADA: "cardano",
      DOT: "polkadot",
      LINK: "chainlink",
      LTC: "litecoin",
      XRP: "ripple",
      SOL: "solana",
      DOGE: "dogecoin",
      BNB: "binancecoin",
      MATIC: "polygon",
    };

    return mapping[cleanedSymbol] || cleanedSymbol.toLowerCase();
  }

  private getCoinName(symbol: string): string {
    const names: { [key: string]: string } = {
      BTC: "Bitcoin",
      ETH: "Ethereum",
      ADA: "Cardano",
      DOT: "Polkadot",
      LINK: "Chainlink",
      LTC: "Litecoin",
      XRP: "Ripple",
      SOL: "Solana"
    };
    return names[symbol.toUpperCase()] || symbol;
  }
}

export const cryptoApi = new CryptoAPI();
