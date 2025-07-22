"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { formatDistanceToNow } from "date-fns";

type RedditPost = {
  id: string;
  title: string;
  author: string;
  url: string;
  selftext: string;
  created_utc: number;
  permalink: string;
};

export default function CommunityPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get("page") || "1");

  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<RedditPost[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Comment form state
  const [commentTitle, setCommentTitle] = useState("");
  const [commentDescription, setCommentDescription] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reddit?page=${currentPage}&limit=10`);
        if (!res.ok) throw new Error("Failed to fetch posts");

        const data = await res.json();
        setPosts(data.posts);
        setFilteredPosts(data.posts);
        setTotalPages(data.totalPages);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  // Filter and sort
  useEffect(() => {
    let filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.selftext.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) =>
      sortOrder === "desc"
        ? b.created_utc - a.created_utc
        : a.created_utc - b.created_utc
    );

    setFilteredPosts(filtered);
  }, [searchTerm, posts, sortOrder]);

  const goToPage = (page: number) => {
    router.push(`/community?page=${page}`);
  };

  const handleCommentSubmit = () => {
    if (commentTitle && commentDescription) {
      alert("Comment submitted (not saved)!");
      setCommentTitle("");
      setCommentDescription("");
    }
  };

  return (
    <div className="min-h-screen bg-[#131722] text-white">
      <MainNav />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">💬 Recent Discussions</h1>
            <p className="text-gray-400 text-sm">Latest posts from r/algotrading</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white w-full sm:w-64"
            />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded text-sm"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading posts...</p>
        ) : error ? (
          <p className="text-center text-red-500">Error: {error}</p>
        ) : (
          <>
            {/* Posts */}
            <div className="grid grid-cols-1 gap-6">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-gray-800 border border-gray-700 rounded-xl shadow hover:shadow-lg transition"
                >
                  <CardHeader className="border-b border-gray-700 pb-2">
                    <CardTitle className="text-base sm:text-lg md:text-xl font-semibold break-words">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <p className="text-sm text-gray-400 mb-2">
                      Posted by <span className="text-white">u/{post.author}</span> •{" "}
                      {formatDistanceToNow(new Date(post.created_utc * 1000), {
                        addSuffix: true,
                      })}
                    </p>

                    {post.selftext ? (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-5 break-words">
                        {post.selftext}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic mb-4">No content available</p>
                    )}

                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      🔗 Read More on Reddit →
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {filteredPosts.length > 0 && (
              <div className="flex flex-wrap justify-center items-center gap-3 mt-10">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-40 text-sm"
                >
                  ⬅ Prev
                </button>

                <span className="text-sm text-gray-300">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-40 text-sm"
                >
                  Next ➡
                </button>
              </div>
            )}

            {/* Add Comment */}
            <div className="mt-12 border-t border-gray-700 pt-6">
              <h2 className="text-xl font-semibold mb-4">📝 Add a Comment</h2>

              <div className="space-y-4">
                <Input
                  placeholder="Comment title..."
                  value={commentTitle}
                  onChange={(e) => setCommentTitle(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white"
                />
                <Textarea
                  placeholder="Share your thoughts..."
                  value={commentDescription}
                  onChange={(e) => setCommentDescription(e.target.value)}
                  rows={4}
                  className="bg-gray-800 border border-gray-700 text-white"
                />
                <div className="flex gap-4">
                  <Button onClick={handleCommentSubmit} className="bg-blue-600 hover:bg-blue-700">
                    Submit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCommentTitle("");
                      setCommentDescription("");
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
