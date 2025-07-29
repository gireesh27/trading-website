const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";
const POLYGON_BASE_URL = "https://api.polygon.io";
const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
export interface CandlestickData {
  time: string;          // e.g., "2025-07-29T10:00:00Z"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjclose?: number;     // Used mainly for adjusted charts
}

export interface StockQuote {
  symbol: string;         // e.g., "AAPL"
  name: string;           // e.g., "Apple Inc."
  price: number;          // current price
  change: number;         // absolute change
  changePercent: number;  // percentage change
  open?: number;          // opening price
  high?: number;          // intraday high
  low?: number;           // intraday low
  previousClose?: number; // previous closing price
  volume?: number;        // trading volume
  marketCap?: number;     // fetched from /stock/metric
  rank?: number;          // only applies to crypto (optional fallback support)
  dominance?: number;     // also mainly for crypto
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

      // Handle Rate Limit (429)
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

  public async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      const quoteData = await this.fetchFromFinnhub<{
        c: number; d: number; dp: number; h: number;
        l: number; o: number; pc: number; v?: number;
      }>(`quote?symbol=${symbol}`);

      if (typeof quoteData.c === "undefined" || quoteData.c === 0) {
        throw new Error("Invalid or zero-value quote data from Finnhub, falling back.");
      }

      // Get company name
      let companyName = symbol;
      try {
        const profile = await this.fetchFromFinnhub<{ name?: string }>(`stock/profile2?symbol=${symbol}`);
        if (profile?.name) companyName = profile.name;
      } catch {
        console.warn(`Could not fetch company name for ${symbol}`);
      }

      // Get market cap
      let marketCap: number | undefined;
      try {
        const metrics = await this.fetchFromFinnhub<{ metric: { marketCapitalization?: number } }>(
          `stock/metric?symbol=${symbol}&metric=all`
        );
        marketCap = metrics.metric?.marketCapitalization;
      } catch {
        console.warn(`Could not fetch market cap for ${symbol}`);
      }

      // Use volume if available, else fallback later
      let volume = quoteData.v;

      if (volume === undefined || volume === 0) {
        console.warn(`Volume missing in Finnhub for ${symbol}, trying fallback`);
        const fallback = await this.getSingleQuote(symbol);
        volume = fallback?.volume ?? 0;
      }

      return {
        symbol,
        name: companyName,
        price: quoteData.c,
        change: quoteData.d,
        changePercent: quoteData.dp,
        high: quoteData.h,
        low: quoteData.l,
        open: quoteData.o,
        previousClose: quoteData.pc,
        volume,

        marketCap,
      };
    } catch (err) {
      console.warn(
        `Finnhub quote failed for ${symbol}, falling back to Polygon. Error: ${(err as Error).message}`
      );

      const fallback = await this.getSingleQuote(symbol);
      if (!fallback) {
        throw new Error(`Fallback failed for ${symbol} — no quote data available.`);
      }

      return fallback;
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

  public async fetchFromPolygon(path: string): Promise<any> {
    const url = `${POLYGON_BASE_URL}${path}${path.includes("?") ? "&" : "?"}apiKey=${POLYGON_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Polygon API error: ${res.status}`);
    return res.json();
  }

  public async getSingleQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const data = await this.fetchFromPolygon(
        `/v2/snapshot/locale/us/markets/stocks/tickers/${symbol.toUpperCase()}`
      );

      const t = data?.ticker;

      if (!t || !t.lastTrade) {
        console.warn(`No data found for symbol: ${symbol}`);
        return null;
      }

      const volume = t.day?.volume ?? t.day?.v ?? 0;
      if (!volume) {
        console.warn(`Volume missing for ${symbol} from Polygon snapshot`);
      }

      return {
        symbol: t.ticker,
        name: t.ticker,
        change: t.todaysChange ?? 0,
        price: t.lastTrade?.p ?? 0,
        changePercent: t.todaysChangePerc ?? 0,
        volume,

        marketCap: t.marketCap ?? 0,
        high: t.day?.h ?? 0,
        low: t.day?.l ?? 0,
      };
    } catch (err) {
      console.error(`❌ Failed to fetch quote for ${symbol}:`, err);
      return null;
    }
  }

  // 🔁 Batch via Promise.all (client-side throttled)
  public async getMultipleQuotes_polygon(symbols: string[]): Promise<StockQuote[]> {
    const results = await Promise.all(
      symbols.map((symbol) => this.getSingleQuote(symbol))
    );
    return results.filter((r): r is StockQuote => r !== null);
  }

  public async getFinancialsReported(symbol: string) {
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

}

export const stockApi = new StockAPI();
