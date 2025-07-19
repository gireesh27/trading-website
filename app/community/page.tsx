"use client"

import type React from "react"

import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, MessageCircle, ThumbsUp, TrendingUp, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

interface Discussion {
  id: string
  title: string
  content: string
  author: string
  timestamp: string
  likes: number
  replies: number
  category: string
}

export default function CommunityPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" })
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    // Mock discussions data
    const mockDiscussions: Discussion[] = [
      {
        id: "1",
        title: "What are your thoughts on the current market rally?",
        content:
          "The markets have been performing exceptionally well this quarter. What factors do you think are driving this growth?",
        author: "TradingPro",
        timestamp: "2024-01-15T10:30:00Z",
        likes: 24,
        replies: 12,
        category: "Market Analysis",
      },
      {
        id: "2",
        title: "Best strategies for crypto trading in 2024",
        content: "Looking for advice on cryptocurrency trading strategies. What has worked well for you this year?",
        author: "CryptoEnthusiast",
        timestamp: "2024-01-15T09:15:00Z",
        likes: 18,
        replies: 8,
        category: "Cryptocurrency",
      },
      {
        id: "3",
        title: "Portfolio diversification tips for beginners",
        content:
          "New to investing and looking for guidance on how to properly diversify my portfolio. Any suggestions?",
        author: "NewInvestor",
        timestamp: "2024-01-15T08:45:00Z",
        likes: 31,
        replies: 15,
        category: "Beginner",
      },
    ]

    setTimeout(() => {
      setDiscussions(mockDiscussions)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredDiscussions = discussions.filter(
    (discussion) =>
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: user.name,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: 0,
      category: newPost.category,
    }

    setDiscussions([newDiscussion, ...discussions])
    setNewPost({ title: "", content: "", category: "General" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-[#131722]">
      <MainNav />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Community</h1>
            <p className="text-gray-400">Connect with traders and share insights</p>
          </div>

          <div className="relative mt-4 md:mt-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* New Post Form */}
            {user && (
              <Card className="bg-gray-800 border-gray-700 mb-6">
                <CardHeader>
                  <CardTitle className="text-white">Start a Discussion</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitPost} className="space-y-4">
                    <Input
                      placeholder="Discussion title..."
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={3}
                      required
                    />
                    <div className="flex items-center justify-between">
                      <select
                        value={newPost.category}
                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
                      >
                        <option value="General">General</option>
                        <option value="Market Analysis">Market Analysis</option>
                        <option value="Cryptocurrency">Cryptocurrency</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Technical Analysis">Technical Analysis</option>
                      </select>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Post Discussion
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Discussions List */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Recent Discussions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-700 h-24 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDiscussions.map((discussion) => (
                      <div
                        key={discussion.id}
                        className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            {discussion.category}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(discussion.timestamp)}</span>
                        </div>
                        <h3 className="text-white font-medium mb-2">{discussion.title}</h3>
                        <p className="text-gray-300 text-sm mb-3">{discussion.content}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">by {discussion.author}</span>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <div className="flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {discussion.likes}
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {discussion.replies}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Community Stats */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-gray-300">Active Members</span>
                  </div>
                  <span className="text-white font-medium">12,543</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-gray-300">Discussions</span>
                  </div>
                  <span className="text-white font-medium">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-gray-300">Online Now</span>
                  </div>
                  <span className="text-white font-medium">892</span>
                </div>
              </CardContent>
            </Card>

            {/* Popular Categories */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Popular Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span className="text-gray-300">Market Analysis</span>
                    <span className="text-xs text-gray-400">234 posts</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span className="text-gray-300">Cryptocurrency</span>
                    <span className="text-xs text-gray-400">189 posts</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span className="text-gray-300">Beginner</span>
                    <span className="text-xs text-gray-400">156 posts</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span className="text-gray-300">Technical Analysis</span>
                    <span className="text-xs text-gray-400">98 posts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
