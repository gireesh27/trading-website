import yahooFinance from "yahoo-finance2";
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";
const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjclose?: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  volume?: number;
  marketCap?: number;
  rank?: number;
  dominance?: number;
}
export interface FinancialReport {
  symbol: string;
  year: number;
  quarter: number;
  reportDate: string;

  report: {
    bs: Record<string, string>; // Balance Sheet
    ic: Record<string, string>; // Income Statement
    cf: Record<string, string>; // Cash Flow Statement
  };

  cik?: string;
  form?: string;
  filedDate?: string;
}


export interface ChartApiResponse {
  meta: any;
  timestamp: number[];
  indicators: {
    quote: Array<{
      high: (number | null)[];
      low: (number | null)[];
      open: (number | null)[];
      close: (number | null)[];
      volume: (number | null)[];
    }>;
    adjclose?: Array<{
      adjclose: (number | null)[];
    }>;
  };
}

export class StockAPI {
  private readonly rapidApiKey: string;
  private readonly finnhubApiKey: string;
  private static readonly RAPID_API_HOST = "apidojo-yahoo-finance-v1.p.rapidapi.com";

  constructor() {
    this.rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "";
    this.finnhubApiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || "";

    if (!this.rapidApiKey) console.warn("⚠️ RapidAPI key is missing.");
    if (!this.finnhubApiKey) console.warn("⚠️ Finnhub API key is missing.");
  }

  private async fetchFromRapidApi<T>(
    url: string,
    options: RequestInit = {},
    retries = 2,
    backoff = 1000
  ): Promise<T> {
    try {
      const response = await fetch(`https://${StockAPI.RAPID_API_HOST}/${url}`, {
        ...options,
        headers: {
          ...options.headers,
          "X-RapidAPI-Key": this.rapidApiKey,
          "X-RapidAPI-Host": StockAPI.RAPID_API_HOST,
        },
      });

      if (response.status === 429 && retries > 0) {
        console.warn(`⚠️ RapidAPI rate limit hit. Retrying in ${backoff}ms...`);
        await new Promise((res) => setTimeout(res, backoff));
        return this.fetchFromRapidApi<T>(url, options, retries - 1, backoff * 2);
      }

      const contentType = response.headers.get("content-type");
      const text = await response.text();

      if (!text.trim()) {
        throw new Error(`Received empty response from RapidAPI for URL: ${url}`);
      }

      try {
        const json = JSON.parse(text);
        return json;
      } catch (jsonErr) {
        throw new Error(`Invalid JSON from RapidAPI: ${text}`);
      }

    } catch (err: any) {
      console.error("❌ fetchFromRapidApi error:", err.message || err);
      throw err;
    }
  }


  private async fetchFromFinnhub<T>(endpoint: string, retries = 2, backoff = 300): Promise<T> {
    try {
      const response = await fetch(`https://finnhub.io/api/v1/${endpoint}&token=${this.finnhubApiKey}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Finnhub API Error (${response.status}): ${errorText}`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error("Received empty response from Finnhub API");
      }
      return JSON.parse(text);
    } catch (err: any) {
      console.error("❌ Finnhub fetch error:", err.message || err);
      throw err;
    }
  }

  public async getFullChartData(symbol: string, range: string, interval: string): Promise<{ chartData: CandlestickData[]; apiResponse: any }> {
    console.log(`Fetching chart data for ${symbol} with range: ${range}, interval: ${interval}`);

    if (interval === "5m") {
      const now = Date.now();
      const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
      const minTimestamp = now - sixtyDaysMs;

      const rangeToDuration: Record<string, number> = {
        "1d": 1,
        "5d": 5,
        "1mo": 30,
        "3mo": 90,
        "6mo": 180,
        "1y": 365,
        "2y": 730,
        "5y": 1825,
      };

      const daysRequested = rangeToDuration[range] ?? 365;
      if (daysRequested > 60) {
        throw new Error("5m interval is not supported for ranges beyond 60 days. Use 15m, 1d instead.");
      }
    }

    const data = await this.fetchFromRapidApi<{
      chart: { result: ChartApiResponse[] | null; error?: { description?: string; message?: string } };
    }>(`stock/v3/get-chart?symbol=${symbol}&range=${range}&interval=${interval}`);

    const chartError = data?.chart?.error;
    if (chartError) {
      throw new Error(chartError.description || chartError.message || "Unknown chart error");
    }

    const chartResult = data?.chart?.result?.[0];
    if (!chartResult || !chartResult.timestamp || !chartResult.indicators?.quote?.[0]) {
      throw new Error(`No chart data found for "${symbol}" from RapidAPI. Check the symbol or try a different one.`);
    }

    const quote = chartResult.indicators.quote[0];
    const adjclose = chartResult.indicators.adjclose?.[0]?.adjclose;

    const formattedData: CandlestickData[] = chartResult.timestamp.map((ts, i) => ({
      time: new Date(ts * 1000).toISOString(),
      open: quote.open[i] ?? 0,
      high: quote.high[i] ?? 0,
      low: quote.low[i] ?? 0,
      close: quote.close[i] ?? 0,
      volume: quote.volume[i] ?? 0,
      adjclose: adjclose?.[i] ?? quote.close[i] ?? 0,
    })).filter(d => d.open && d.high && d.low && d.close);

    return { chartData: formattedData, apiResponse: data };
  }

  public async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      const chart = await this.getFullChartData(symbol, "1d", "1d");
      const latest = chart.chartData[chart.chartData.length - 1];

      return {
        symbol,
        name: symbol,
        price: latest.close,
        change: latest.close - latest.open,
        changePercent: ((latest.close - latest.open) / latest.open) * 100,
        high: latest.high,
        low: latest.low,
        open: latest.open,
        previousClose: latest.open,
        volume: latest.volume,
      };
    } catch (err) {
      console.warn(`getStockQuote failed for ${symbol}: ${(err as Error).message}`);
      throw err;
    }
  }

  private async getQuoteFromRapidAPI(symbol: string): Promise<StockQuote> {
    const response = await this.fetchFromRapidApi<{
      price?: {
        regularMarketPrice?: { raw: number };
        regularMarketChange?: { raw: number };
        regularMarketChangePercent?: { raw: number };
        regularMarketDayHigh?: { raw: number };
        regularMarketDayLow?: { raw: number };
        regularMarketOpen?: { raw: number };
        regularMarketPreviousClose?: { raw: number };
        longName?: string;
        regularMarketVolume?: { raw: number };
        marketCap?: { raw: number };
      };
      message?: string;
    }>(`stock/v2/get-summary?symbol=${symbol}&region=US`);

    if (response.message) {
      throw new Error(response.message);
    }

    const priceData = response.price;
    return {
      symbol,
      name: priceData?.longName || symbol,
      price: priceData?.regularMarketPrice?.raw ?? 0,
      change: priceData?.regularMarketChange?.raw ?? 0,
      changePercent: priceData?.regularMarketChangePercent?.raw ?? 0,
      high: priceData?.regularMarketDayHigh?.raw,
      low: priceData?.regularMarketDayLow?.raw,
      open: priceData?.regularMarketOpen?.raw,
      previousClose: priceData?.regularMarketPreviousClose?.raw,
      volume: priceData?.regularMarketVolume?.raw,
      marketCap: priceData?.marketCap?.raw,
    };
  }
  public async searchSymbol(query: string): Promise<{ symbol: string; name: string }[]> {
    if (!query.trim()) return []; // ✅ Prevent empty calls

    try {
      const response = await this.fetchFromFinnhub<{ result: { symbol: string; description: string }[] }>(
        `search?q=${encodeURIComponent(query)}`
      );

      return response.result.map((item) => ({
        symbol: item.symbol,
        name: item.description,
      }));
    } catch (err) {
      console.error("❌ Error searching symbol:", err);
      return [];
    }
  }

  public async getQuote(symbol: string): Promise<StockQuote> {
    return this.getStockQuote(symbol);
  }
  public async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const promises = symbols.map(symbol =>
      this.getQuote(symbol).catch(err => {
        console.warn(`⚠️ Skipping ${symbol} due to error:`, err.message);
        return null;
      })
    );

    const results = await Promise.all(promises);
    return results.filter((quote): quote is StockQuote => quote !== null);
  }
 // inside StockAPI.ts
private cachedSymbols: { symbol: string; name: string }[] | null = null;

private async getUSStockSymbols(): Promise<{ symbol: string; name: string }[]> {
  if (this.cachedSymbols) return this.cachedSymbols;

  const res = await fetch(
    `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${FINNHUB_API_KEY}`
  );
  const data = await res.json();

  this.cachedSymbols = data
    .filter((s: any) => s.symbol && s.displaySymbol && !s.symbol.includes('.'))
    .map((s: any) => ({ symbol: s.symbol, name: s.description }))
    .slice(0, 300); // limit to 300 for performance

  return this.cachedSymbols ?? [];
}

public async getPaginatedQuotes(page = 1, limit = 12): Promise<StockQuote[]> {
  try {
    const symbols = await this.getUSStockSymbols();
    const start = (page - 1) * limit;
    const end = start + limit;
    const selectedSymbols = symbols.slice(start, end).map((s) => s.symbol);

    const quotePromises = selectedSymbols.map(async (symbol) => {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      const data = await res.json();
      return {
        symbol,
        name: symbols.find((s) => s.symbol === symbol)?.name || symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
        volume: data.v,
        marketCap: 0, // Finnhub does not provide marketCap here
      };
    });

    return await Promise.all(quotePromises);
  } catch (err: any) {
    console.error("❌ Error fetching paginated quotes:", err.message);
    return [];
  }
}


public async  getFinancialsReported(symbol: string) {
  try {
    const url = `${BASE_URL}/stock/financials-reported?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Defensive check: ensure it's an object with expected structure
    if (!data || !Array.isArray(data.data)) {
      console.error("Unexpected financials format:", data);
      return [];
    }

    return data.data; // Array of financial report items
  } catch (err: any) {
    console.error("❌ Error fetching financials reported:", err.message);
    return [];
  }
}

}
export const stockApi = new StockAPI();
