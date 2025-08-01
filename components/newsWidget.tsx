"use client"
import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Newspaper,
  ExternalLink,
  Clock,
  TrendingUp,
  Globe,
  RefreshCw,
} from "lucide-react"

export interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: string
  url: string
  image: string
  category: string
  sentiment?: "positive" | "negative" | "neutral"
  relatedSymbols?: string[]
}

export function NewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  const fetchNews = async (category = "general") => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/news?category=${category}`)
      if (!response.ok) throw new Error("Failed to fetch news")
      const data = await response.json()
      setNews(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNews("general")
  }, [])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    fetchNews(tab === "all" ? "general" : tab)
  }

  const refreshNews = () => {
    fetchNews(activeTab === "all" ? "general" : activeTab)
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400"
      case "negative":
        return "text-red-400"
      case "neutral":
        return "text-gray-400"
      default:
        return "text-gray-400"
    }
  }

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-600"
      case "negative":
        return "bg-red-600"
      case "neutral":
        return "bg-gray-600"
      default:
        return "bg-gray-600"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "market":
        return <TrendingUp className="h-3 w-3" />
      case "crypto":
        return <Globe className="h-3 w-3" />
      default:
        return <Newspaper className="h-3 w-3" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <Card className="bg-[#1f2937] border border-gray-700 rounded-2xl shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2 text-lg font-semibold">
            <Newspaper className="h-5 w-5" />
            <span>Market News</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshNews}
            disabled={isLoading}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-700 rounded-t-md px-2 py-1">
            {["all", "general", "crypto", "forex"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="text-white text-sm hover:bg-gray-600 rounded-md transition"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="px-4 py-4">
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <RefreshCw className="h-6 w-6 text-white animate-spin" />
                </div>
              ) : (
                news.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition cursor-pointer"
                    onClick={() => window.open(item.url, "_blank")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`${getSentimentBadge(item.sentiment)} text-xs`}>
                          {getCategoryIcon(item.category)}
                          <span className="ml-1 capitalize">{item.category}</span>
                        </Badge>
                        {item.relatedSymbols?.slice(0, 2).map((symbol) => (
                          <Badge
                            key={symbol}
                            variant="outline"
                            className="text-xs border-gray-600 text-gray-300"
                          >
                            {symbol}
                          </Badge>
                        ))}
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>

                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                      {item.summary}
                    </p>

                    <div className="flex justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{item.source}</span>
                        {item.sentiment && (
                          <span className={`${getSentimentColor(item.sentiment)}`}>
                            • {item.sentiment}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(item.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
