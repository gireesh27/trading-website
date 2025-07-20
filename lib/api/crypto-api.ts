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

  async getMultipleCryptoQuotes(symbols: string[]): Promise<CryptoQuote[]> {
    try {
      const coinIds = symbols.map((symbol) => this.getCoinId(symbol)).join(",");

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&sparkline=false`
      );

      const data = await response.json();

      return symbols.map((symbol) => {
        const coinId = this.getCoinId(symbol);
        const coin = data.find((c: any) => c.id === coinId);

        return {
          symbol,
          name: this.getCoinName(symbol),
          price: coin?.current_price || 0,
          change: coin?.price_change_24h || 0,
          changePercent: coin?.price_change_percentage_24h || 0,
          volume: coin?.total_volume || 0,
          marketCap: coin?.market_cap
            ? `${(coin.market_cap / 1_000_000_000).toFixed(2)}B`
            : undefined,
          high: coin?.high_24h || 0,
          low: coin?.low_24h || 0
        };
      });
    } catch (error) {
      console.error("Error fetching multiple crypto quotes:", error);
      throw error;
    }
  }

  private getCoinId(symbol: string): string {
    const mapping: { [key: string]: string } = {
      BTC: "bitcoin",
      ETH: "ethereum",
      ADA: "cardano",
      DOT: "polkadot",
      LINK: "chainlink",
      LTC: "litecoin",
      XRP: "ripple",
      SOL: "solana"
    };
    return mapping[symbol.toUpperCase()] || symbol.toLowerCase();
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

export const cryptoAPI = new CryptoAPI();
