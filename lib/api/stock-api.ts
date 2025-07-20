// Replace Finnhub with Alpha Vantage
const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || "083KOTWN718U3GFJ";

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
  // Get real-time stock quote from Alpha Vantage
  async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      const json = await response.json();

      // **Robust Error Handling**
      if (json["Note"] || json["Information"] || json["Error Message"]) {
        const message = json["Note"] || json["Information"] || json["Error Message"];
        throw new Error(`Alpha Vantage API Error: ${message}`);
      }
      
      const data = json["Global Quote"];
      if (!data || Object.keys(data).length === 0) {
        throw new Error(`No quote data returned for ${symbol}. This could be due to an invalid symbol or API limits.`);
      }

      return {
        symbol: data["01. symbol"],
        name: data["01. symbol"],
        price: parseFloat(data["05. price"]),
        change: parseFloat(data["09. change"]),
        changePercent: parseFloat(data["10. change percent"].replace('%', '')),
        volume: parseInt(data["06. volume"]),
        high: parseFloat(data["03. high"]),
        low: parseFloat(data["04. low"]),
        open: parseFloat(data["02. open"]),
        previousClose: parseFloat(data["08. previous close"]),
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

  // Get historical chart data
  async getChartData(symbol: string, timeframe: string = '1D'): Promise<ChartData[]> {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      const json = await response.json();
      
      // **DEFINITIVE FIX: Robust Error Handling**
      if (json["Note"] || json["Information"] || json["Error Message"]) {
        const message = json["Note"] || json["Information"] || json["Error Message"];
        throw new Error(`Alpha Vantage API Error: ${message}`);
      }

      const series = json["Time Series (Daily)"];
      if (!series) {
        // This log will now only be hit if the API returns a valid but empty object,
        // which could indicate a temporary issue or a symbol with no historical data.
        console.warn(`No "Time Series (Daily)" data found for ${symbol}, though no explicit API error was returned.`);
        return [];
      }

      return Object.entries(series).map(([date, values]: [string, any]) => ({
        time: date,
        timestamp: new Date(date),
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        volume: parseInt(values["6. volume"]),
      })).reverse();
    } catch (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error);
      return [];
    }
  }
}

export const stockAPI = new StockAPI();