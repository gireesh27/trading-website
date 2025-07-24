// ✅ Using Finnhub for stock quotes
// ✅ Using Yahoo Finance via RapidAPI for chart data

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const YAHOO_API_HOST = "apidojo-yahoo-finance-v1.p.rapidapi.com";
const YAHOO_API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;

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
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class StockAPI {
  // ✅ Real-time Quote from Finnhub
  async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      }

      const data = await res.json();

      if (!data || !data.c) {
        throw new Error("Invalid quote data from Finnhub");
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
    } catch (err) {
      console.error("Error fetching quote from Finnhub:", err);
      throw err;
    }
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    return this.getStockQuote(symbol);
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const promises = symbols.map((s) => this.getStockQuote(s));
    return Promise.all(promises);
  }

  // ✅ Chart data from Yahoo via RapidAPI
  async getChartData(symbol: string, timeframe: string = "1d"): Promise<ChartData[]> {
    try {
      const intervalMap: Record<string, string> = {
        "1m": "1m",
        "5m": "5m",
        "15m": "15m",
        "30m": "30m",
        "1h": "60m",
        "1d": "1d",
        "1w": "1wk",
        "1M": "1mo",
      };

      const interval = intervalMap[timeframe] || "1d";
      const res = await fetch(
        `https://${YAHOO_API_HOST}/stock/v3/get-chart?symbol=${symbol}&interval=${interval}&range=1mo&region=US`,
        {
          headers: {
            "X-RapidAPI-Host": YAHOO_API_HOST,
            "X-RapidAPI-Key": YAHOO_API_KEY || "",
          },
        }
      );

      const data = await res.json();
      const chart = data.chart.result?.[0];

      if (!chart || !chart.timestamp || !chart.indicators) {
        throw new Error("Invalid chart response");
      }

      const ohlc = chart.indicators.quote[0];

      return chart.timestamp
        .map((ts: number, i: number) => ({
          time: new Date(ts * 1000).toISOString(),
          timestamp: ts * 1000,
          open: ohlc.open[i],
          high: ohlc.high[i],
          low: ohlc.low[i],
          close: ohlc.close[i],
          volume: ohlc.volume[i],
        }))
        .filter((item: { open: null }) => item.open !== null);
    } catch (err) {
      console.error("Error fetching Yahoo chart data:", err);
      return [];
    }
  }
}

export const stockAPI = new StockAPI();
