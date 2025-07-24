// lib/api/stock-api.ts

// TYPE DEFINITIONS for API responses and clean data structures
// =================================================================

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
}

export interface ChartApiResponse {
  meta: any;
  timestamp: number[];
  events?: {
    splits?: { [key: string]: { splitRatio: string } };
  };
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

export interface CompanyProfile { assetProfile: any; }
export interface CompanyStatistics { defaultKeyStatistics: any; financialData: any; }
export interface CompanyHoldings { institutionOwnership: { ownershipList: any[] }; }

/**
 * A reusable class to interact with stock data APIs.
 */
export class StockAPI {
  private readonly rapidApiKey: string;
  private readonly finnhubApiKey: string;
  private static readonly RAPID_API_HOST = "apidojo-yahoo-finance-v1.p.rapidapi.com";

  constructor() {
    this.rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "";
    this.finnhubApiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || "";
    if (!this.rapidApiKey) console.warn("RapidAPI key is missing.");
    if (!this.finnhubApiKey) console.warn("Finnhub API key is missing.");
  }

  private async fetchFromRapidApi<T>(endpoint: string): Promise<T> {
    const url = `https://${StockAPI.RAPID_API_HOST}/${endpoint}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": this.rapidApiKey,
        "x-rapidapi-host": StockAPI.RAPID_API_HOST,
      },
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: `API request failed: ${response.status}` }));
      throw new Error(errorBody.message);
    }
    return response.json();
  }

  public async getFullChartData(symbol: string, range: string = "1y", interval: string = "1d") {
    const data = await this.fetchFromRapidApi<{ chart: { result: ChartApiResponse[] | null; error: any } }>(
      `stock/v3/get-chart?symbol=${symbol}&range=${range}&interval=${interval}`
    );

    // FIX #1: Check for an explicit error object in the API response body first.
    const chartError = data?.chart?.error;
    if (chartError) {
      throw new Error(chartError.description || chartError.message || `API returned an error for symbol "${symbol}".`);
    }

    const chartResult = data?.chart?.result?.[0];
    if (!chartResult || !chartResult.timestamp || !chartResult.indicators?.quote?.[0]) {
      throw new Error(`No chart data found for "${symbol}". The symbol may be invalid or the API limit has been reached.`);
    }
    
    const quote = chartResult.indicators.quote[0];
    // FIX #2: Safely access adjclose using optional chaining (?.) as it might not always be present.
    const adjclose = chartResult.indicators.adjclose?.[0]?.adjclose;

    const formattedData: CandlestickData[] = chartResult.timestamp.map((ts, i) => ({
      time: new Date(ts * 1000).toISOString(),
      open: quote.open[i] || 0,
      high: quote.high[i] || 0,
      low: quote.low[i] || 0,
      close: quote.close[i] || 0,
      volume: quote.volume[i] || 0,
      // FIX #3: Provide a fallback to the regular 'close' price if adjclose is not available.
      adjclose: adjclose?.[i] || quote.close[i] || 0, 
    })).filter(d => d.open && d.high && d.low && d.close);
    
    return { chartData: formattedData, apiResponse: chartResult };
  }

  public async getProfile(symbol: string): Promise<CompanyProfile | null> {
    return this.fetchFromRapidApi(`stock/v3/get-profile?symbol=${symbol}&region=US`);
  }

  public async getStatistics(symbol: string): Promise<CompanyStatistics | null> {
    return this.fetchFromRapidApi(`stock/v4/get-statistics?symbol=${symbol}&region=US`);
  }

  public async getHoldings(symbol: string): Promise<CompanyHoldings | null> {
    return this.fetchFromRapidApi(`stock/v3/get-holders?symbol=${symbol}&region=US`);
  }

  public async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.finnhubApiKey}`);
      if (!res.ok) throw new Error(`Finnhub API Error: ${res.status} - ${res.statusText}`);
      const data = await res.json();
      if (typeof data.c === 'undefined') throw new Error("Invalid quote data from Finnhub");

      return {
        symbol,
        name: symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
      };
    } catch (err) {
      console.error(`Error fetching Finnhub quote for ${symbol}:`, err);
      throw err;
    }
  }

  public async getQuote(symbol: string): Promise<StockQuote> {
    return this.getStockQuote(symbol);
  }

  public async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    return Promise.all(symbols.map(s => this.getStockQuote(s)));
  }
}

export const stockApi = new StockAPI();
