"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMarketData } from "@/contexts/enhanced-market-data-context"
import { Clock, ExternalLink, TrendingUp } from "lucide-react"

export function LiveNews() {
  const { news, isLoading } = useMarketData()

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-600"
      case "negative":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-3 w-3" />
      case "negative":
        return <TrendingUp className="h-3 w-3 rotate-180" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-500" />
          Market News
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {news.slice(0, 8).map((item) => (
              <div key={item.id} className="border-b border-gray-700 pb-3 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium text-sm leading-tight flex-1 mr-2">{item.title}</h4>
                  <Badge className={`text-xs ${getSentimentColor(item.sentiment)} flex items-center`}>
                    {getSentimentIcon(item.sentiment)}
                    <span className="ml-1 capitalize">{item.sentiment}</span>
                  </Badge>
                </div>
                <p className="text-gray-400 text-xs mb-2 line-clamp-2">{item.summary}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{item.source}</span>
                  <div className="flex items-center space-x-2">
                    <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
