"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Newspaper,
  ExternalLink,
  Clock,
  TrendingUp,
  Globe,
  RefreshCw,
} from "lucide-react";
import { LoaderTwo } from "@/components/ui/loader";
import Loader from "./loader";
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  image: string;
  category: string;
  sentiment?: "positive" | "negative" | "neutral";
  relatedSymbols?: string[];
}

export function NewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchNews = async (category = "general") => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/news?category=${category}`);
      if (!response.ok) throw new Error("Failed to fetch news");
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews("general");
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchNews(tab === "all" ? "general" : tab);
  };

  const refreshNews = () => {
    fetchNews(activeTab === "all" ? "general" : activeTab);
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400";
      case "negative":
        return "text-red-400";
      case "neutral":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-600";
      case "negative":
        return "bg-red-600";
      case "neutral":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "market":
        return <TrendingUp className="h-3 w-3" />;
      case "crypto":
        return <Globe className="h-3 w-3" />;
      default:
        return <Newspaper className="h-3 w-3" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="bg-slate-900/60 backdrop-blur-lg border border-slate-800 rounded-2xl shadow-2xl shadow-black/30 text-slate-100 h-full">
        {/* Header */}
        <CardHeader className="pb-4 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>
              {/* Aurora Gradient Header */}
              <span
                className="
              text-xl  xl:text-2xl 2xl:text-3xl 
              text-center sm:text-left 
              font-semibold 
              bg-gradient-to-br from-slate-200 to-cyan-400 
              bg-clip-text text-transparent
              leading-snug tracking-tight
            "
              >
                Market News
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshNews}
              disabled={isLoading}
              className="text-slate-400 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full hover:bg-slate-700/50 hover:text-white transition-colors mx-auto sm:mx-0"
            >
              <RefreshCw className={`h-4 w-4 md:h-5 md:w-5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Pill-style Tabs */}
            <TabsList
              className="
            grid grid-cols-2 sm:grid-cols-4 
            bg-slate-900/80 
            h-auto p-1 rounded-none
            text-xs sm:text-sm md:text-base
          "
            >
              {["all", "general", "crypto", "forex"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="
                capitalize text-slate-400 rounded-md 
                data-[state=active]:bg-gradient-to-r 
                data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 
                data-[state=active]:text-white data-[state=active]:font-semibold 
                data-[state=active]:shadow-lg 
                transition-all
              "
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            <TabsContent value={activeTab} className="p-4">
              <div className="space-y-4 max-h-[60vh] sm:max-h-[65vh] md:max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40 sm:h-48">
                    <Loader />
                  </div>
                ) : news.length > 0 ? (
                  news.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="
                    group p-3 sm:p-4 
                    bg-slate-800/50 rounded-lg border-l-2 border-slate-700 
                    hover:border-l-cyan-400 hover:bg-slate-800 
                    transition-all cursor-pointer 
                    shadow-md hover:shadow-lg hover:shadow-cyan-500/10
                  "
                      onClick={() => window.open(item.url, "_blank")}
                    >
                      {/* Top Row: Category + Related Symbols */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`${getSentimentBadge(item.sentiment)} text-xs sm:text-sm py-1`}>
                            {getCategoryIcon(item.category)}
                            <span className="ml-1.5 capitalize">{item.category}</span>
                          </Badge>
                          {item.relatedSymbols?.slice(0, 2).map((symbol) => (
                            <Badge
                              key={symbol}
                              variant="outline"
                              className="text-xs sm:text-sm border-slate-600 text-slate-300 rounded-full px-2.5 py-0.5"
                            >
                              {symbol}
                            </Badge>
                          ))}
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors self-end sm:self-center" />
                      </div>

                      {/* Title & Summary */}
                      <h3 className="text-slate-100 font-semibold text-sm sm:text-base md:text-lg mb-1.5 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm mb-4 line-clamp-2">
                        {item.summary}
                      </p>

                      {/* Footer: Source & Time */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs sm:text-sm text-slate-500 gap-2">
                        <div className="flex items-center gap-2 font-medium">
                          <span className="text-slate-400">{item.source}</span>
                          {item.sentiment && (
                            <span className={`${getSentimentColor(item.sentiment)}`}>
                              • {item.sentiment}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{formatTimeAgo(item.publishedAt)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-40 sm:h-48 text-slate-500">
                    No news available
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>

  );
}
