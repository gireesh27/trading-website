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
    <div className="min-h-screen bg-[#131722] text-white">
      <MainNav />

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">💬 Recent Discussions</h1>
              <p className="text-gray-400 text-sm">Latest posts from r/algotrading</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Input
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white w-full sm:w-64"
              />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="bg-gray-800 border-gray-700 text-white rounded px-3 py-2 text-sm"
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
                <Card key={post.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-2">
                      Posted by u/{post.author} • {formatDistanceToNow(new Date(post.created_utc * 1000), { addSuffix: true })}
                    </p>
                    {post.selftext ? (
                      <p className="text-gray-300 text-sm mb-2 line-clamp-5">{post.selftext}</p>
                    ) : (
                      <p className="italic text-gray-500">No description provided.</p>
                    )}
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
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
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Add a Comment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={commentTitle}
                  onChange={(e) => setCommentTitle(e.target.value)}
                  className="bg-gray-700 text-white"
                />
                <Textarea
                  placeholder="Write your comment here..."
                  value={commentDescription}
                  onChange={(e) => setCommentDescription(e.target.value)}
                  className="bg-gray-700 text-white"
                  rows={4}
                />
                <div className="flex gap-4">
                  <Button onClick={handleCommentSubmit} className="bg-blue-600 hover:bg-blue-700">Comment</Button>
                  <Button variant="outline" className="border-gray-600 text-white" onClick={() => { setCommentTitle(""); setCommentDescription(""); }}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating comment button and popup for mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Button
          className="bg-blue-600 hover:bg-blue-700 rounded-full p-3 shadow-lg"
          onClick={() => setShowMobileComment(true)}
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>

      {showMobileComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Add a Comment
            </h3>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={commentTitle}
                onChange={(e) => setCommentTitle(e.target.value)}
                className="bg-gray-700 text-white"
              />
              <Textarea
                placeholder="Write your comment here..."
                value={commentDescription}
                onChange={(e) => setCommentDescription(e.target.value)}
                className="bg-gray-700 text-white"
                rows={4}
              />
              <div className="flex gap-4 justify-end">
                <Button onClick={handleCommentSubmit} className="bg-blue-600 hover:bg-blue-700">Comment</Button>
                <Button variant="outline" className="border-gray-600 text-white" onClick={() => setShowMobileComment(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}