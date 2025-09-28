import { CryptoData } from "@/types/crypto-types";
import https from "https";
import axios from "axios";
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";


const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Disable SSL cert validation - risky!
});
export interface CryptoQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high: number;
  low: number;
  rank?: number;
  dominance?: number;
}

class CryptoAPI {
  //https://trading-website-two.vercel.app/
  async getCryptoQuote(symbol: string): Promise<CryptoQuote> {
    try {
      const coinId = this.getCoinId(symbol);
      console.log("coinId", coinId);

      const url = `https://api.coinpaprika.com/v1/tickers/${coinId}`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch crypto quote: ${response.status} ${response.statusText}`
        );
      }

      const coin = await response.json();

      return {
        symbol: coin.symbol, // "ETH"
        name: coin.name,     // "Ethereum"
        price: coin.quotes.USD.price ?? 0,                 // 4002.53
        change: coin.quotes.USD.percent_change_24h ?? 0,  // -0.18
        changePercent: coin.quotes.USD.percent_change_24h ?? 0, // same as change
        volume: coin.quotes.USD.volume_24h ?? 0,          // 13765515383.85
        marketCap: coin.quotes.USD.market_cap ?? 0,       // 482010087809
        high: coin.quotes.USD.ath_price ?? 0,            // 4946.22
        low: 0,                                           // CoinPaprika does not provide low directly
        rank: coin.rank,                                 // 2
      };

    } catch (error) {
      console.error("Error fetching crypto quote:", error);
      throw error;
    }
  }


  async getMultipleCryptoQuotes(): Promise<CryptoData[]> {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch crypto data");
      }

      const data = await response.json();

      return data.map((coin: any) => ({
        symbol: `${coin.symbol.toUpperCase()}-USD`,
        name: coin.name,
        price: coin.current_price || 0,
        change: coin.price_change_24h || 0,
        changePercent: coin.price_change_percentage_24h || 0,
        change24h: coin.price_change_24h || 0,
        volume: coin.total_volume || 0,
        marketCap: coin.market_cap || 0,
        high: coin.high_24h || 0,
        low: coin.low_24h || 0,
        rank: coin.market_cap_rank,
        dominance: coin.market_cap_change_percentage_24h_in_currency,
      }));
    } catch (error) {
      console.error("❌ Error fetching multiple crypto quotes:", error);
      throw error;
    }
  }

  private getCoinId(symbol: string): string {
    const cleanedSymbol = symbol.replace("-USD", "").toUpperCase();
    console.log("cleanedSymbol", cleanedSymbol);
    // Mapping from the trading symbol to the CoinGecko API ID
    const mapping: { [key: string]: string } = {
      "1INCH": "1inch-1inch",
      AAVE: "aave-aave",
      ADA: "ada-cardano",
      AERGO: "aergo-aergo",
      ALGO: "algo-algorand",
      AMP: "amp-amp",
      ANKR: "ankr-ankr",
      ANT: "aragon-ant",
      APE: "apecoin-ape",
      API3: "api3-api3",
      APT: "aptos-apt",
      AR: "arweave-ar",
      ARB: "arbitrum-arb",
      ARPA: "arpa-arpa",
      ASTR: "astar-astr",
      ATOM: "atom-cosmos",
      AUDIO: "audius-audio",
      AVAX: "avax-avalanche",
      AXS: "axie-infinity-axs",
      BAL: "balancer-bal",
      BAND: "band-protocol-band",
      BAT: "bat-basic-attention-token",
      BCH: "bch-bitcoin-cash",
      BNB: "bnb-binance-coin",
      BTC: "btc-bitcoin",
      BTG: "btg-bitcoin-gold",
      BSV: "bsv-bitcoin-sv",
      CELO: "celo-celo",
      CHZ: "chz-chiliz",
      COMP: "comp-compound",
      CRO: "cro-crypto-com-chain",
      CRV: "crv-curve-dao-token",
      DAI: "dai-dai",
      DOGE: "doge-dogecoin",
      DOT: "dot-polkadot",
      DYDX: "dydx-dydx",
      EGLD: "egld-elrond",
      ENJ: "enj-enjincoin",
      ENS: "ens-ethereum-name-service",
      ETC: "etc-ethereum-classic",
      ETH: "eth-ethereum",
      FET: "fet-fetch-ai",
      FIL: "fil-filecoin",
      FTM: "ftm-fantom",
      FTT: "ftt-ftx-token",
      GALA: "gala-gala",
      GLM: "glm-golem",
      HBAR: "hbar-hedera-hashgraph",
      HNT: "hnt-helium",
      ICP: "icp-internet-computer",
      ICX: "icx-icon",
      ILV: "ilv-illuvium",
      INJ: "inj-injective-protocol",
      IOTX: "iotx-iotex",
      KAVA: "kava-kava",
      KCS: "kcs-kucoin-token",
      KSM: "ksm-kusama",
      LDO: "ldo-lido-dao",
      LINK: "link-chainlink",
      LTC: "ltc-litecoin",
      LUNC: "lunc-terra-luna-classic",
      MANA: "mana-decentraland",
      MATIC: "matic-polygon",
      MKR: "mkr-maker",
      NEAR: "near-near",
      NEO: "neo-neo",
      NEXO: "nexo-nexo",
      OKB: "okb-okb",
      ONE: "one-harmony",
      ONT: "ont-ontology",
      OP: "op-optimism",
      PAXG: "paxg-pax-gold",
      PEPE: "pepe-pepe",
      QNT: "qnt-quant",
      QTUM: "qtum-qtum",
      RUNE: "rune-thorchain",
      RVN: "rvn-ravencoin",
      SAND: "sand-the-sandbox",
      SHIB: "shib-shiba-inu",
      SOL: "sol-solana",
      SPELL: "spell-spell-token",
      SRM: "srm-serum",
      STETH: "steth-lido-staked-ether",
      SUSHI: "sushi-sushiswap",
      THETA: "theta-theta",
      TRX: "trx-tron",
      UNI: "uni-uniswap",
      USDC: "usdc-usd-coin",
      USDT: "usdt-tether",
      VET: "vet-vechain",
      WBTC: "wbtc-wrapped-bitcoin",
      XEC: "xec-ecash",
      XLM: "xlm-stellar",
      XMR: "xmr-monero",
      XRP: "xrp-xrp",
      XTZ: "xtz-tezos",
      YFI: "yfi-yearn-finance",
      ZEC: "zec-zcash",
      ZIL: "zil-zilliqa",
      ZRX: "zrx-0x",
    };


    return mapping[cleanedSymbol] || cleanedSymbol.toLowerCase();
  }

}

export const cryptoApi = new CryptoAPI();
