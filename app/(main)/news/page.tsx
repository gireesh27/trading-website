"use client";

import { MainNav } from "@/components/main-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Clock,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { gsap } from "gsap";

export default function EnhancedNewsPage() {
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
    }
  }, []);
  const { news, refreshData, isLoading } = useMarketData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [selectedSentiment, setSelectedSentiment] = useState("all");

  const sentiments = ["all", "positive", "negative", "neutral"];

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSentiment =
      selectedSentiment === "all" || item.sentiment === selectedSentiment;

    return matchesSearch  && matchesSentiment;
  });

  const formatDate = (dateInput: string | Date | undefined): string => {
    if (!dateInput) return "N/A";

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Invalid date";

    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const getSentimentColor = (
    sentiment?: "positive" | "negative" | "neutral" | string
  ): string => {
    if (!sentiment) return "bg-gray-500/20 text-gray-400 border-gray-500/30";

    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "negative":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "neutral":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      forex: "bg-purple-500/20 text-purple-400 border-purple-500/30", // This line is fine, category is a string
      crypto: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      merger: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    };
    return (
      colors[category.toLowerCase()] ||
      "bg-gray-500/20 text-gray-400 border-gray-500/30"
    );
  };

  return (
    <div className="min-h-screen bg-[#131722]">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Market News</h1>
            <p className="text-gray-400">
              Latest financial news and market updates
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Button
              onClick={() => refreshData({ category: selectedCategory })}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {/* Sentiment Filter */}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedSentiment}
                  onChange={(e) => setSelectedSentiment(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
                >
                  {sentiments.map((sentiment) => (
                    <option key={sentiment} value={sentiment}>
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main News Feed */}
          <motion.div
            ref={cardRef}
            className="lg:col-span-3 relative group"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Glow Gradient BG */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1f2937] to-[#0f172a] blur-xl rounded-3xl z-0 group-hover:scale-[1.02] transition-transform duration-500" />

            <Card className="relative z-10 border border-gray-700/60 backdrop-blur-md bg-black/30 rounded-3xl shadow-lg overflow-hidden transition-all duration-300">
              <CardHeader className="bg-gradient-to-tr from-[#1e293b]/80 to-[#0f172a]/80 rounded-t-3xl border-b border-slate-800">
                <CardTitle className="text-white font-bold text-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Latest News ({filteredNews.length})
                  </div>
                  {isLoading && (
                    <div className="text-sm text-muted-foreground flex items-center">
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      Updating...
                    </div>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="max-h-[800px] overflow-y-auto px-4 py-6 custom-scroll space-y-6">
                {filteredNews.length > 0 ? (
                  filteredNews.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.5 }}
                      className="rounded-xl p-5 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/60 hover:shadow-2xl hover:scale-[1.01] transition-transform border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                          <Badge className={getSentimentColor(item.sentiment)}>
                            {item.sentiment || "neutral"}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(item.publishedAt)}
                        </div>
                      </div>

                      {item.image && (
                        <div className="mb-4 overflow-hidden rounded-lg">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-44 object-cover rounded-md transition-all hover:scale-105 duration-500"
                            onError={(e) =>
                              ((e.target as HTMLImageElement).style.display =
                                "none")
                            }
                          />
                        </div>
                      )}
                      <h3 className="text-white text-lg font-semibold mb-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                        {item.summary}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Source: {item.source}
                        </span>
                        {item.url && item.url !== "#" && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1 text-sm"
                          >
                            Read full article{" "}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 py-6">
                    No news articles found matching your criteria.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Sentiment */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">
                  Market Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sentiments.slice(1).map((sentiment) => {
                    const count = news.filter(
                      (item) => item.sentiment === sentiment
                    ).length;
                    const percentage =
                      news.length > 0 ? (count / news.length) * 100 : 0;

                    return (
                      <div key={sentiment} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300 capitalize">
                            {sentiment}
                          </span>
                          <span className="text-white">{count}</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              sentiment === "positive"
                                ? "bg-green-500"
                                : sentiment === "negative"
                                ? "bg-red-500"
                                : "bg-gray-400"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">News Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Articles</span>
                  <span className="text-white font-medium">{news.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-white font-medium">
                    {news.length > 0
                      ? formatDate(news[0].publishedAt)
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sources</span>
                  <span className="text-white font-medium">
                    {new Set(news.map((item) => item.source)).size}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
