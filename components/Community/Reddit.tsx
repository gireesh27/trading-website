"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

import RedditImageFeed from "@/components/Community/Images";
import StockTwitsTrendingFeed from "@/components/Community/Stock-Twits";

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

type TabId = "community" | "images" | "stocktwits" ;

const SUBREDDITS = [
  "algotrading",
  "Forex",
  "options",
  "investing",
  "technicalanalysis",
  "wallstreetbets",
  "RobinHood",
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabId>("community");

  // Common search & sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Community posts state
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [allPosts, setAllPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  const [subreddit, setSubreddit] = useState("algotrading");

  // Fetch posts for community tab
  useEffect(() => {
    if (activeTab !== "community") return;

    setLoading(true);
    setError("");
    fetch(`/api/reddit?subreddit=${subreddit}&page=1&limit=100`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      })
      .then((data) => {
        // Sort by created_utc
        const sorted = data.posts.sort((a: RedditPost, b: RedditPost) =>
          sortOrder === "desc"
            ? b.created_utc - a.created_utc
            : a.created_utc - b.created_utc
        );
        setAllPosts(sorted);
        setPosts(sorted.slice(0, 10));
        setVisibleCount(10);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeTab, subreddit, sortOrder]);

  // Infinite scroll / load more on community tab
  useEffect(() => {
    if (activeTab !== "community") return;

    if (visibleCount >= allPosts.length) return; // no more posts

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 400
      ) {
        setVisibleCount((v) => Math.min(v + 10, allPosts.length));
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleCount, allPosts.length, activeTab]);

  // Filter posts client-side based on search term
  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts.slice(0, visibleCount);

    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.selftext.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.slice(0, visibleCount);
  }, [posts, searchTerm, visibleCount]);

  // UI for Search + Sort consistent across tabs
  const SearchSortBar = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 max-w-xl mx-auto px-2">
      <Input
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex-grow"
      />
      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
        className="bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 max-w-[160px]"
      >
        <option value="desc">Newest First</option>
        <option value="asc">Oldest First</option>
      </select>
    </div>
  );

  return (
    <div className=" text-white py-8 px-4 min-h-screen bg-[rgb(19,23,34)]">
      {/* Tabs */}
      <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
        {[
          { id: "community", label: "Community" },
          { id: "images", label: "Images" },
          { id: "stocktwits", label: "StockTwits" },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => {
              setActiveTab(tab.id as TabId);
              setSearchTerm("");
              setSortOrder("desc");
              setVisibleCount(10);
              setError("");
            }}
            className="px-5 py-2 rounded-full text-sm font-semibold"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Search & Sort for all tabs */}
      {SearchSortBar}

      {/* Tab Content */}
      {activeTab === "community" && (
        <>
          {/* Subreddit Selector */}
          <div className="mb-6 flex flex-wrap gap-3 justify-center max-w-xl mx-auto px-2">
            {SUBREDDITS.map((sub) => (
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
            <p className="text-gray-400 text-center py-20">Loading posts...</p>
          ) : error ? (
            <p className="text-red-500 text-center py-20">Error: {error}</p>
          ) : filteredPosts.length === 0 ? (
            <p className="text-gray-400 text-center py-20">No posts found.</p>
          ) : (
            <div className="grid gap-6 max-w-4xl mx-auto">
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
                      {formatDistanceToNow(new Date(post.created_utc * 1000), {
                        addSuffix: true,
                      })}
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
            </div>
          )}
        </>
      )}

      {/* For other tabs, just render the components with searchTerm and sortOrder passed if needed */}

      {activeTab === "images" && <RedditImageFeed searchTerm={searchTerm} sortOrder={sortOrder} />}

      {activeTab === "stocktwits" && <StockTwitsTrendingFeed searchTerm={searchTerm} sortOrder={sortOrder} />}

    </div>
  );
}
