const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY

export interface NewsItem {
  image: string
  id: string
  title: string
  summary: string
  source: string
  publishedAt: Date
  url: string
  category: 'market' | 'crypto' | 'earnings' | 'general'
  sentiment?: 'positive' | 'negative' | 'neutral' 
  relatedSymbols?: string[]
}

class NewsAPI {
  async getMarketNews(category: string = 'general'): Promise<NewsItem[]> {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/news?category=${category}&token=${NEWS_API_KEY}`
      )
      const data = await response.json()

      return data.map((item: any, index: number) => ({
        id: item.id?.toString() || index.toString(),
        title: item.headline,
        summary: item.summary,
        source: item.source,
        publishedAt: new Date(item.datetime * 1000),
        url: item.url,
        category: this.mapCategory(category),
        sentiment: this.analyzeSentiment(item.headline),
        relatedSymbols: item.related ? [item.related] : undefined
      }))
    } catch (error) {
      console.error('Error fetching market news:', error)
      return []
    }
  }
    public async getCompanyNews(symbol: string): Promise<NewsItem[]> {
    try {
      const from = new Date()
      from.setDate(from.getDate() - 7)
      const to = new Date()

      const response = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}&token=${NEWS_API_KEY}`
      )
      const data = await response.json()

      return data.slice(0, 10).map((item: any, index: number) => ({
        id: `${symbol}-${item.id || index}`,
        title: item.headline,
        summary: item.summary,
        source: item.source,
        publishedAt: new Date(item.datetime * 1000),
        url: item.url,
        category: 'earnings' as const,
        sentiment: this.analyzeSentiment(item.headline),
        relatedSymbols: [symbol]
      }))
    } catch (error) {
      console.error('Error fetching company news:', error)
      return []
    }
  }

private mapCategory(
  category: string
): 'market' | 'crypto' | 'earnings' | 'general' {
  const mapping: Record<string, 'market' | 'crypto' | 'earnings' | 'general'> = {
    general: 'market',
    forex: 'market',
    crypto: 'crypto',
    merger: 'earnings',
  };

  return mapping[category] ?? 'general';
}

async getCryptoNews(symbol: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=crypto&token=${NEWS_API_KEY}`
    )
    const data = await response.json()

    const normalizedSymbol = this.normalizeSymbol(symbol)

    const allNews = data.slice(0, 30).map((item: any, index: number) => ({
      id: `crypto-${item.id || index}`,
      title: item.headline,
      summary: item.summary,
      source: item.source,
      publishedAt: new Date(item.datetime * 1000),
      url: item.url,
      category: 'crypto' as const,
      sentiment: this.analyzeSentiment(item.headline),
      relatedSymbols: this.extractCryptoSymbols(item.headline),
    }))

    // Filter news where relatedSymbols include our normalizedSymbol
    return allNews.filter((item: { relatedSymbols: string | any[] }) =>
      item.relatedSymbols.includes(normalizedSymbol)
    )
  } catch (error) {
    console.error('Error fetching crypto news:', error)
    return []
  }
}
private normalizeSymbol(rawSymbol: string): string {
  return rawSymbol.split('-')[0].toUpperCase(); // BTC-USD → BTC
}

private analyzeSentiment(headline: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['surge', 'rise', 'gain', 'up', 'bull', 'strong', 'beat', 'exceed', 'growth', 'profit'];
  const negativeWords = ['drop', 'fall', 'decline', 'down', 'bear', 'weak', 'miss', 'loss', 'crash', 'plunge'];

  const lowerHeadline = headline.toLowerCase();

  const positiveCount = positiveWords.filter(word => lowerHeadline.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerHeadline.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

private extractCryptoSymbols(headline: string): string[] {
  const cryptoSymbols = [
  'BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'LTC', 'XRP', 'SOL',
  'BNB', 'DOGE', 'AVAX', 'MATIC', 'SHIB', 'TRX', 'XLM',
  'ATOM', 'UNI', 'ETC', 'HBAR', 'ICP', 'APT', 'ARB', 'SAND',
  'AAVE', 'EGLD', 'NEAR', 'FIL', 'XTZ', 'THETA', 'VET',
  'MKR', 'KAVA', 'AXS', 'GRT', 'ALGO', 'FTM', 'STX', 'RNDR'
]

const cryptoNames = [
  'bitcoin', 'ethereum', 'cardano', 'polkadot', 'chainlink', 'litecoin', 'ripple', 'solana',
  'binance', 'dogecoin', 'avalanche', 'polygon', 'shiba', 'tron', 'stellar',
  'cosmos', 'uniswap', 'ethereum classic', 'hedera', 'internet computer', 'aptos',
  'arbitrum', 'sandbox', 'aave', 'elrond', 'near', 'filecoin', 'tezos', 'theta',
  'vechain', 'maker', 'kava', 'axie', 'graph', 'algorand', 'fantom', 'stacks', 'render'
]

  
  const found: string[] = []
  const lowerHeadline = headline.toLowerCase()

  cryptoSymbols.forEach((symbol, index) => {
    if (
      lowerHeadline.includes(symbol.toLowerCase()) ||
      lowerHeadline.includes(cryptoNames[index])
    ) {
      found.push(symbol)
    }
  })

  return found
}

}

export const newsAPI = new NewsAPI()
