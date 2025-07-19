"use client"

import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, TrendingUp, ExternalLink, RefreshCw, Filter } from "lucide-react"
import { useState } from "react"
import { useMarketData } from "@/contexts/enhanced-market-data-context"

export default function EnhancedNewsPage() {
  const { news, refreshData, isLoading } = useMarketData()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSentiment, setSelectedSentiment] = useState("all")

  const categories = ["all", "general", "forex", "crypto", "merger"]
  const sentiments = ["all", "positive", "negative", "neutral"]

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory
    const matchesSentiment = selectedSentiment === "all" || item.sentiment === selectedSentiment

    return matchesSearch && matchesCategory && matchesSentiment
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "negative":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      forex: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      crypto: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      merger: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    }
    return colors[category.toLowerCase()] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  return (
    <div className="min-h-screen bg-[#131722]">
      <MainNav />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Market News</h1>
            <p className="text-gray-400">Latest financial news and market updates</p>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Button onClick={refreshData} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
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

              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
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
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Latest News ({filteredNews.length})
                  </div>
                  {isLoading && (
                    <div className="flex items-center text-sm text-gray-400">
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      Updating...
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredNews.length > 0 ? (
                  <div className="space-y-4 max-h-[800px] overflow-y-auto">
                    {filteredNews.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                            <Badge className={getSentimentColor(item.sentiment)}>{item.sentiment}</Badge>
                          </div>
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(item.publishedAt)}
                          </div>
                        </div>

                        {item.image && (
                          <div className="mb-3">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.title}
                              className="w-full h-48 object-cover rounded-lg"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).style.display = "none"
                              }}
                            />
                          </div>
                        )}

                        <h3 className="text-white font-medium mb-2 text-lg leading-tight">{item.title}</h3>
                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{item.summary}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-medium">Source: {item.source}</span>
                          {item.url && item.url !== "#" && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm flex items-center transition-colors"
                            >
                              Read full article
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No news articles found matching your criteria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Sentiment */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Market Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sentiments.slice(1).map((sentiment) => {
                    const count = news.filter((item) => item.sentiment === sentiment).length
                    const percentage = news.length > 0 ? (count / news.length) * 100 : 0

                    return (
                      <div key={sentiment} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300 capitalize">{sentiment}</span>
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
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">News Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.slice(1).map((category) => {
                    const count = news.filter((item) => item.category.toLowerCase() === category.toLowerCase()).length

                    return (
                      <div key={category} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                        <span className="text-gray-300 capitalize">{category}</span>
                        <Badge className={getCategoryColor(category)}>{count}</Badge>
                      </div>
                    )
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
                    {news.length > 0 ? formatDate(news[0].publishedAt) : "Never"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sources</span>
                  <span className="text-white font-medium">{new Set(news.map((item) => item.source)).size}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
