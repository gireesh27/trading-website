"use client";
import { useEffect, useState } from "react";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Sparkle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";

interface CryptoNewsFeedProps {
  symbol: string;
}
interface NewsItem {
  image: string;
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: Date;
  url: string;
  category: "market" | "crypto" | "earnings" | "general";
  sentiment?: "positive" | "negative" | "neutral";
  relatedSymbols?: string[];
}
export const CryptoNewsFeed: React.FC<CryptoNewsFeedProps> = ({ symbol }) => {
  const { fetchCryptoNews, cryptoNews, loadingCryptoNews } = useMarketData();
  const [visibleCount, setVisibleCount] = useState(5);
  useEffect(() => {
    if (symbol) fetchCryptoNews(symbol);
  }, [symbol, fetchCryptoNews]);
  // @ts-ignore
  const news: NewsItem[] = cryptoNews[symbol] || [];
  const sentimentStyles = {
    positive: "bg-green-800/40 text-green-300 border-green-400/20",
    negative: "bg-red-800/40 text-red-300 border-red-400/20",
    neutral: "bg-gray-700/40 text-gray-300 border-gray-400/20",
  };
  const handleViewMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  return (
    <div className="space-y-6 rounded-xl p-6 bg-gray-900 backdrop-blur-md border border-white/10 shadow-xl">
      <div className="flex items-center gap-3">
        <Sparkle className="text-indigo-400 h-6 w-6 animate-pulse" />
        <h2 className="text-2xl font-bold text-white tracking-wide">
          Latest News for {symbol}
        </h2>
      </div>

      {loadingCryptoNews ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-24 w-full rounded-xl bg-gray-700/50"
            />
          ))}
        </div>
      ) : news.length === 0 ? (
        <p className="text-md text-gray-400 italic">
          No recent news found for {symbol}.
        </p>
      ) : (
        <>
          <ul className="space-y-4">
            <AnimatePresence>
              {news.slice(0, visibleCount).map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-indigo-400 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-indigo-300 hover:underline flex items-center gap-1"
                    >
                      {item.title}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <span
                      className={`text-xs border px-2 py-0.5 rounded-full font-medium capitalize ${
                        sentimentStyles[
                          item.sentiment as keyof typeof sentimentStyles
                        ]
                      }`}
                    >
                      {item.sentiment}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                    {item.summary}
                  </p>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="italic">{item.source}</span>
                    <span>
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {visibleCount < news.length && (
            <div className="text-center mt-4">
              <Button
                onClick={handleViewMore}
                variant="outline"
                className="bg-gradient-to-br from-blue-500 to-purple-600 text-white py-2 px-5 rounded-xl hover:opacity-90 transition shadow-md text-sm font-semibold"
              >
                View More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
