const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY

export interface NewsItem {
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
        `https://finnhub.io/api/v1/news?category=${category}&token=${FINNHUB_API_KEY}`
      )
      const data = await response.json()

      return data.slice(0, 20).map((item: any, index: number) => ({
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

  async getCryptoNews(): Promise<NewsItem[]> {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/news?category=crypto&token=${FINNHUB_API_KEY}`
      )
      const data = await response.json()

      return data.slice(0, 15).map((item: any, index: number) => ({
        id: `crypto-${item.id || index}`,
        title: item.headline,
        summary: item.summary,
        source: item.source,
        publishedAt: new Date(item.datetime * 1000),
        url: item.url,
        category: 'crypto' as const,
        sentiment: this.analyzeSentiment(item.headline),
        relatedSymbols: this.extractCryptoSymbols(item.headline)
      }))
    } catch (error) {
      console.error('Error fetching crypto news:', error)
      return []
    }
  }

  async getCompanyNews(symbol: string): Promise<NewsItem[]> {
    try {
      const from = new Date()
      from.setDate(from.getDate() - 7)
      const to = new Date()

      const response = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}&token=${FINNHUB_API_KEY}`
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

  private mapCategory(category: string): 'market' | 'crypto' | 'earnings' | 'general' {
    const mapping: { [key: string]: 'market' | 'crypto' | 'earnings' | 'general' } = {
      'general': 'market',
      'forex': 'market',
      'crypto': 'crypto',
      'merger': 'earnings'
    }
    return mapping[category] || 'general'
  }

  private analyzeSentiment(headline: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['surge', 'rise', 'gain', 'up', 'bull', 'strong', 'beat', 'exceed', 'growth', 'profit']
    const negativeWords = ['drop', 'fall', 'decline', 'down', 'bear', 'weak', 'miss', 'loss', 'crash', 'plunge']
    
    const lowerHeadline = headline.toLowerCase()
    
    const positiveCount = positiveWords.filter(word => lowerHeadline.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerHeadline.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  private extractCryptoSymbols(headline: string): string[] {
    const cryptoSymbols = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'LTC', 'XRP', 'SOL']
    const cryptoNames = ['bitcoin', 'ethereum', 'cardano', 'polkadot', 'chainlink', 'litecoin', 'ripple', 'solana']
    
    const found: string[] = []
    const lowerHeadline = headline.toLowerCase()
    
    cryptoSymbols.forEach((symbol, index) => {
      if (lowerHeadline.includes(symbol.toLowerCase()) || lowerHeadline.includes(cryptoNames[index])) {
        found.push(symbol)
      }
    })
    
    return found
  }
}

export const newsAPI = new NewsAPI()
