const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;

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

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: Date;
  url: string;
  category: 'market' | 'crypto' | 'earnings' | 'general';
  sentiment?: 'positive' | 'negative' | 'neutral';
  relatedSymbols?: string[];
}

class StockAPI {
  // Get real-time stock quote
  async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      const data = await response.json();

      const profileResponse = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      const profile = await profileResponse.json();

      return {
        symbol,
        name: profile.name || symbol,
        price: data.c || 0,
        change: data.d || 0,
        changePercent: data.dp || 0,
        volume: data.v || 0,
        high: data.h || 0,
        low: data.l || 0,
        open: data.o || 0,
        previousClose: data.pc || 0,
        marketCap: profile.marketCapitalization
          ? `${(profile.marketCapitalization / 1000).toFixed(2)}B`
          : undefined,
      };
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      throw error;
    }
  }

  // Alias method to support legacy or external calls
  async getQuote(symbol: string): Promise<StockQuote> {
    return this.getStockQuote(symbol);
  }

  // Get multiple stock quotes
  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    try {
      const promises = symbols.map((symbol) => this.getStockQuote(symbol));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching multiple quotes:', error);
      throw error;
    }
  }

  // Get historical chart data
  async getChartData(symbol: string, timeframe: string = '1D'): Promise<ChartData[]> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const from = now - this.getTimeframeSeconds(timeframe);

      const response = await fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${this.getResolution(
          timeframe
        )}&from=${from}&to=${now}&token=${FINNHUB_API_KEY}`
      );
      const data = await response.json();

      if (data.s !== 'ok' || !data.t) {
        console.warn(`No chart data for ${symbol} at timeframe ${timeframe}.`);
        return [];
      }

      return data.t.map((timestamp: number, index: number) => ({
        timestamp: new Date(timestamp * 1000),
        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: data.c[index],
        volume: data.v[index],
        time: timestamp,
      }));
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return [];
    }
  }

  // Get market news
  async getMarketNews(category: string = 'general'): Promise<NewsItem[]> {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/news?category=${category}&token=${FINNHUB_API_KEY}`
      );
      const data = await response.json();

      return data.slice(0, 10).map((item: any, index: number) => ({
        id: item.id?.toString() || index.toString(),
        title: item.headline,
        summary: item.summary,
        source: item.source,
        publishedAt: new Date(item.datetime * 1000),
        url: item.url,
        category: category as any,
        relatedSymbols: item.related ? [item.related] : undefined,
      }));
    } catch (error) {
      console.error('Error fetching market news:', error);
      throw error;
    }
  }

  // Get company-specific news
  async getCompanyNews(symbol: string): Promise<NewsItem[]> {
    try {
      const from = new Date();
      from.setDate(from.getDate() - 7);
      const to = new Date();

      const response = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from.toISOString().split('T')[0]}&to=${to
          .toISOString()
          .split('T')[0]}&token=${FINNHUB_API_KEY}`
      );
      const data = await response.json();

      return data.slice(0, 10).map((item: any, index: number) => ({
        id: item.id?.toString() || index.toString(),
        title: item.headline,
        summary: item.summary,
        source: item.source,
        publishedAt: new Date(item.datetime * 1000),
        url: item.url,
        category: 'earnings',
        relatedSymbols: [symbol],
      }));
    } catch (error) {
      console.error('Error fetching company news:', error);
      throw error;
    }
  }

  private getTimeframeSeconds(timeframe: string): number {
    const timeframes: { [key: string]: number } = {
      '1m': 60 * 5,
      '5m': 3600,
      '15m': 3600 * 4,
      '1H': 86400 * 2,
      '4H': 86400 * 7,
      '1D': 86400 * 90,
      '1W': 86400 * 365,
      '1M': 86400 * 365 * 5,
    };
    return timeframes[timeframe] || 86400 * 90;
  }

  private getResolution(timeframe: string): string {
    const resolutions: { [key: string]: string } = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '1H': '60',
      '4H': 'D',
      '1D': 'D',
      '1W': 'W',
      '1M': 'M',
    };
    return resolutions[timeframe] || 'D';
  }
}

export const stockAPI = new StockAPI();
