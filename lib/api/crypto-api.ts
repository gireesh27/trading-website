const COINAPI_KEY = process.env.NEXT_PUBLIC_COINAPI_KEY

export interface CryptoQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: string
  high: number
  low: number
}

class CryptoAPI {
  async getCryptoQuote(symbol: string): Promise<CryptoQuote> {
    try {
      // Using CoinGecko API (free tier)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${this.getCoinId(symbol)}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      )
      const data = await response.json()
      const coinId = this.getCoinId(symbol)
      const coinData = data[coinId]

      return {
        symbol,
        name: this.getCoinName(symbol),
        price: coinData.usd || 0,
        change: coinData.usd_24h_change || 0,
        changePercent: coinData.usd_24h_change || 0,
        volume: coinData.usd_24h_vol || 0,
        marketCap: coinData.usd_market_cap ? `${(coinData.usd_market_cap / 1000000000).toFixed(2)}B` : undefined,
        high: 0, // Would need additional API call
        low: 0   // Would need additional API call
      }
    } catch (error) {
      console.error('Error fetching crypto quote:', error)
      throw error
    }
  }

  async getMultipleCryptoQuotes(symbols: string[]): Promise<CryptoQuote[]> {
    try {
      const coinIds = symbols.map(symbol => this.getCoinId(symbol)).join(',')
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      )
      const data = await response.json()

      return symbols.map(symbol => {
        const coinId = this.getCoinId(symbol)
        const coinData = data[coinId] || {}
        
        return {
          symbol,
          name: this.getCoinName(symbol),
          price: coinData.usd || 0,
          change: coinData.usd_24h_change || 0,
          changePercent: coinData.usd_24h_change || 0,
          volume: coinData.usd_24h_vol || 0,
          marketCap: coinData.usd_market_cap ? `${(coinData.usd_market_cap / 1000000000).toFixed(2)}B` : undefined,
          high: 0,
          low: 0
        }
      })
    } catch (error) {
      console.error('Error fetching multiple crypto quotes:', error)
      throw error
    }
  }

  private getCoinId(symbol: string): string {
    const mapping: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'LINK': 'chainlink',
      'LTC': 'litecoin',
      'XRP': 'ripple',
      'SOL': 'solana'
    }
    return mapping[symbol] || symbol.toLowerCase()
  }

  private getCoinName(symbol: string): string {
    const names: { [key: string]: string } = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'ADA': 'Cardano',
      'DOT': 'Polkadot',
      'LINK': 'Chainlink',
      'LTC': 'Litecoin',
      'XRP': 'Ripple',
      'SOL': 'Solana'
    }
    return names[symbol] || symbol
  }
}

export const cryptoAPI = new CryptoAPI()
