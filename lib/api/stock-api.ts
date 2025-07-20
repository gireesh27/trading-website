const FINNHUB_API_KEY =
  process.env.NEXT_PUBLIC_FINNHUB_API_KEY

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: string;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface ChartData {
  time: string | number | Date;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class StockAPI {
  async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      const data = await response.json();

      if (!data || !data.c) {
        throw new Error(`No quote data returned for ${symbol}.`);
      }

      return {
        symbol,
        name: symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        volume: data.v,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
      };
    } catch (error) {
      console.error(`Error fetching stock quote for ${symbol}:`, error);
      throw error;
    }
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    return this.getStockQuote(symbol);
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const promises = symbols.map((symbol) => this.getStockQuote(symbol));
    return await Promise.all(promises);
  }

  // ✅ Get historical chart data from Finnhub
  async getChartData(symbol: string, timeframe: string = "1D"): Promise<ChartData[]> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const oneMonthAgo = now - 30 * 24 * 60 * 60;

      const resolution = timeframe === "1D" ? "D" : "60"; // D for daily, 60 for hourly
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${oneMonthAgo}&to=${now}&token=${FINNHUB_API_KEY}`
      );
      const data = await response.json();

      if (data.s !== "ok") {
        throw new Error(`Failed to fetch chart data for ${symbol}. Status: ${data.s}`);
      }

      return data.t.map((timestamp: number, index: number) => ({
        time: new Date(timestamp * 1000).toISOString(),
        timestamp: new Date(timestamp * 1000),
        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: data.c[index],
        volume: data.v[index],
      }));
    } catch (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error);
      return [];
    }
  }
}

export const stockAPI = new StockAPI();
