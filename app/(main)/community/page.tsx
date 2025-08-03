"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";

interface RedditPost {
  id: string;
  title: string;
  author: string;
  url: string;
  selftext: string;
  created_utc: number;
  permalink: string;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [allPosts, setAllPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [visibleCount, setVisibleCount] = useState(10);
  const [commentTitle, setCommentTitle] = useState("");
  const [commentDescription, setCommentDescription] = useState("");
  const [showMobileComment, setShowMobileComment] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reddit?page=1&limit=1000`);
        if (!res.ok) throw new Error("Failed to fetch posts");

        const data = await res.json();
        let sorted = data.posts.sort((a: RedditPost, b: RedditPost) =>
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
  }, [sortOrder]);

  useEffect(() => {
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
  }, [allPosts]);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.selftext.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCommentSubmit = () => {
    if (commentTitle && commentDescription) {
      alert("Comment submitted (not saved)!");
      setCommentTitle("");
      setCommentDescription("");
      setShowMobileComment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(19,23,34)] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            {/* Heading and subtitle */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                💬 Recent Discussions
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Latest posts from{" "}
                <span className="text-blue-400 font-medium">r/algotrading</span>
              </p>
            </div>

            {/* Search and sort controls */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
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
          </div>

          {loading ? (
            <p className="text-gray-400">Loading posts...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : (
            <div className="grid gap-4">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-gradient-to-b from-gray-800 via-gray-900 to-black border border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
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
                      <p className="text-gray-300 text-sm mb-4 line-clamp-5 leading-relaxed">
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
        </div>

        {/* Comment Section Sticky on Desktop */}
        <div className="hidden md:block sticky top-24 h-fit">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-xl font-semibold tracking-wide">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Add a Comment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Enter a short title..."
                  value={commentTitle}
                  onChange={(e) => setCommentTitle(e.target.value)}
                  className="bg-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                <Textarea
                  placeholder="Write your thoughts here..."
                  value={commentDescription}
                  onChange={(e) => setCommentDescription(e.target.value)}
                  rows={4}
                  className="bg-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                <div className="flex gap-4 justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 shadow-md">
                    Comment
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-black hover:bg-gray-800 hover:text-white"
                    onClick={() => {
                      setCommentTitle("");
                      setCommentDescription("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Floating comment button and popup for mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Button
          className="bg-blue-600 hover:bg-blue-700 rounded-full p-3 shadow-2xl"
          onClick={() => setShowMobileComment(true)}
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </Button>
      </div>
      {showMobileComment && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center px-4">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md border border-gray-700 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-400" />
              Add a Comment
            </h3>
            <div className="space-y-4">
              <Input
                placeholder="Enter a title..."
                value={commentTitle}
                onChange={(e) => setCommentTitle(e.target.value)}
                className="bg-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500"
              />
              <Textarea
                placeholder="Write your thoughts here..."
                value={commentDescription}
                onChange={(e) => setCommentDescription(e.target.value)}
                rows={4}
                className="bg-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500"
              />
              <div className="flex gap-4 justify-end">
                <Button
                  onClick={handleCommentSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 shadow"
                >
                  Comment
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-600 text-black hover:bg-gray-800 shadow "
                  onClick={() => setShowMobileComment(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
