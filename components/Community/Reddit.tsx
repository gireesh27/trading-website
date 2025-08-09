"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import RedditImageFeed from "@/components/Community/Images";
import StockTwitsTrendingFeed from "@/components/Community/Stock-Twits";
import TwitterFeed from "./Twitter";

interface RedditPost {
  image: any;
  id: string;
  title: string;
  author: string;
  url: string;
  selftext: string;
  created_utc: number;
  permalink: string;
}

export default function CommunityPage() {
  // States for Reddit posts and UI
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [allPosts, setAllPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [visibleCount, setVisibleCount] = useState(10);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Tabs: community (reddit), images (reddit images feed), stocktwits
  const [activeTab, setActiveTab] = useState<
    "community" | "images" | "stocktwits" | "twitter"
  >("community");
  const [subreddit, setSubreddit] = useState("algotrading");

  // Fetch Reddit posts on subreddit or sortOrder change (only for community tab)
  useEffect(() => {
    if (activeTab !== "community") return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/reddit?subreddit=${subreddit}&page=1&limit=100`
        );
        if (!res.ok) throw new Error("Failed to fetch posts");

        const data = await res.json();
        let sorted = data.posts.sort(
          (a: { created_utc: number }, b: { created_utc: number }) =>
            sortOrder === "desc"
              ? b.created_utc - a.created_utc
              : a.created_utc - b.created_utc
        );
        setAllPosts(sorted);
        setPosts(sorted.slice(0, 10));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [sortOrder, subreddit, activeTab]);

  // Infinite scroll observer for loading more posts
  useEffect(() => {
    if (activeTab !== "community") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPosts((prev) => {
            const nextItems = allPosts.slice(prev.length, prev.length + 10);
            return [...prev, ...nextItems];
          });
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [allPosts, activeTab]);

  // Filter posts by search term
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.selftext.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render
  return (
    <div className="min-h-screen bg-[rgb(19,23,34)] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs navigation */}
        <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
          {[
            { id: "community", label: "Community" },
            { id: "images", label: "Images" },
            { id: "stocktwits", label: "StockTwits" },
            { id: "twitter", label: "Twitter" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-5 py-2 rounded-full text-sm font-semibold"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Search & Sort only for Community tab */}
        {activeTab === "community" && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <Input
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 w-full sm:w-64 transition-all duration-200"
            />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        )}

        {/* Main content based on tab */}
        {activeTab === "community" && (
          <>
            <div className="mb-6 flex gap-4">
              {[
                "algotrading",
                "Forex",
                "options",
                "investing",
                "technicalanalysis",
                "wallstreetbets",
                "RobinHood",
              ].map((sub) => (
                <Button
                  key={sub}
                  variant={subreddit === sub ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSubreddit(sub)}
                  className="px-4 py-2 rounded-md font-semibold transition"
                >
                  r/{sub}
                </Button>
              ))}
            </div>
            {loading ? (
              <p className="text-gray-400 text-center py-20">
                Loading posts...
              </p>
            ) : error ? (
              <p className="text-red-500 text-center py-20">Error: {error}</p>
            ) : filteredPosts.length === 0 ? (
              <p className="text-gray-400 text-center py-20">No posts found.</p>
            ) : (
              <div className="grid gap-6">
                {filteredPosts.map((post) => (
                  <Card
                    key={post.id}
                    className="bg-gradient-to-b from-gray-800 via-gray-900 to-black border border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold text-white line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>

                    {post.image && (
                      <div className="relative group">
                        <Image
                          src={post.image}
                          alt={post.title}
                          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                          width={500}
                          height={300}
                          priority
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    )}

                    <CardContent>
                      <p className="text-sm text-gray-400 mb-2">
                        Posted by{" "}
                        <span className="text-blue-400 font-medium">
                          u/{post.author}
                        </span>{" "}
                        •{" "}
                        {formatDistanceToNow(
                          new Date(post.created_utc * 1000),
                          {
                            addSuffix: true,
                          }
                        )}
                      </p>

                      {post.selftext ? (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-4 leading-relaxed">
                          {post.selftext}
                        </p>
                      ) : (
                        <p className="italic text-gray-500 mb-4">
                          No description provided.
                        </p>
                      )}

                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 transition-colors duration-200 font-medium text-sm"
                      >
                        🔗 Read More on Reddit →
                      </a>
                    </CardContent>
                  </Card>
                ))}
                <div ref={loadMoreRef} className="h-10"></div>
              </div>
            )}
          </>
        )}

        {activeTab === "images" && <RedditImageFeed />}

        {activeTab === "stocktwits" && <StockTwitsTrendingFeed />}
        {activeTab === "twitter" && ( <TwitterFeed />)}
      </div>

    </div>
  );
}
