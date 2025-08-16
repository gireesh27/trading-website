"use client";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
export interface CryptoData {
  symbol: string;
  name?: string;
  price: number;
  changePercent: number;
}

export default function CryptoTicker() {
  const { stocks } = useMarketData();
  const tickerItems = [ ...stocks].map((s) => ({
    symbol: s.symbol,
    price: s.price,
    changePercent: s.changePercent ?? 0,
  }));

  // Duplicate items for seamless scroll
  const duplicatedItems = [...tickerItems, ...tickerItems];

  return (
    <div className="marquee w-[1%] hide">
      <div className="marquee-content">
        {duplicatedItems.map((item, index) => (
          <div
            key={`${item.symbol}-${index}`}
            className="flex-shrink-0 flex items-center gap-2 border-r border-zinc-800 pr-6"
          >
            <span className="font-bold text-white">{item.symbol}</span>
            <span className="text-zinc-400">${item.price.toFixed(2)}</span>
            <span
              className={
                item.changePercent > 0
                  ? "text-green-500"
                  : item.changePercent < 0
                  ? "text-red-500"
                  : "text-zinc-400"
              }
            >
              {item.changePercent > 0 ? "+" : ""}
              {item.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
