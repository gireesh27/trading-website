"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import Loader from "../loader";

interface RedditPost {
  id: string;
  title: string;
  author: string;
  url: string;
  image: string | null;
  ups: number;
  selftext: string;
  created_utc: number;
  permalink: string;
}

const SUBREDDITS = [
  "CryptoCurrency",
  "technology",
  "Daytrading",
  "ETFs",
];

const LIMIT = 24;

interface Props {
  searchTerm: string;
  sortOrder: "asc" | "desc";
}

export default function RedditImageFeed({ searchTerm, sortOrder }: Props) {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<RedditPost[]>([]);
  const [page, setPage] = useState(1);
  const [subreddit, setSubreddit] = useState("CryptoCurrency");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [lightboxPost, setLightboxPost] = useState<RedditPost | null>(null);

  // Fetch posts when subreddit or page changes
  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/reddit/images?subreddit=${subreddit}&page=${page}&limit=${LIMIT}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      })
      .then((data) => {
        setPosts(data.posts);
        setTotalPages(data.totalPages || 1);
      })
      .catch((e: any) => setError(e.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, [subreddit, page]);

  // Reset page when subreddit changes
  useEffect(() => {
    setPage(1);
  }, [subreddit]);

  // Filter and sort posts client-side when posts, searchTerm or sortOrder changes
  useEffect(() => {
    let filtered = posts;

    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerTerm) ||
          p.selftext.toLowerCase().includes(lowerTerm)
      );
    }

    filtered = filtered.sort((a, b) =>
      sortOrder === "asc"
        ? a.created_utc - b.created_utc
        : b.created_utc - a.created_utc
    );

    setFilteredPosts(filtered);
  }, [posts, searchTerm, sortOrder]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white max-w-[1280px] mx-auto">
      {/* Subreddit selector */}
      <div className="mb-6 flex flex-wrap gap-4">
        {SUBREDDITS.map((sub) => (
          <Button
            key={sub}
            size="sm"
            variant={subreddit === sub ? "default" : "ghost"}
            onClick={() => setSubreddit(sub)}
            className="rounded-md font-semibold transition"
          >
            r/{sub}
          </Button>
        ))}
      </div>

      {/* Pagination controls top */}
      <div className="flex justify-between items-center mb-4">
        <Button
          size="sm"
          variant="ghost"
          disabled={page === 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ← Previous
        </Button>
        <p>
          Page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </p>
        <Button
          size="sm"
          variant="ghost"
          disabled={page === totalPages || loading}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next →
        </Button>
      </div>

      {/* Loading & error */}
      {loading &&  <Loader/>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {/* Posts grid */}
      <div
        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6"
        style={{ columnFill: "balance" }}
      >
        {filteredPosts.length === 0 && !loading && (
          <p className="text-center text-gray-400 col-span-full py-10">
            No posts found.
          </p>
        )}
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="relative mb-4 break-inside rounded-lg overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-shadow bg-gray-800"
            onClick={() => setLightboxPost(post)}
            title={post.title}
          >
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={post.image ?? "/placeholder.png"}
                alt={post.title}
                fill
                className="object-cover rounded-lg group-hover:brightness-90 transition"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
              <h3 className="font-semibold text-sm line-clamp-2">{post.title}</h3>
              <p className="text-xs opacity-80 mt-0.5">
                u/{post.author} • {post.ups} ▲ •{" "}
                {formatDistanceToNow(new Date(post.created_utc * 1000), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls bottom */}
      <div className="flex justify-between items-center mt-6">
        <Button
          size="sm"
          variant="secondary"
          disabled={page === 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ← Previous
        </Button>
        <p>
          Page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </p>
        <Button
          size="sm"
          variant="secondary"
          disabled={page === totalPages || loading}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next →
        </Button>
      </div>

      {/* Lightbox modal */}
      {lightboxPost && (
        <div
          onClick={() => setLightboxPost(null)}
          className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-6 z-[9999] cursor-pointer"
        >
          <div
            className="max-w-4xl w-full max-h-full overflow-auto bg-gray-900 rounded-lg p-4 relative cursor-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white text-xl mb-4 font-bold">{lightboxPost.title}</h2>
            <div className="relative w-full h-[60vh] mb-4">
              <Image
                src={lightboxPost.image ?? "/placeholder.png"}
                alt={lightboxPost.title}
                fill
                className="object-contain rounded"
                sizes="100vw"
              />
            </div>

            <iframe
              src={`https://www.redditmedia.com${lightboxPost.permalink}?ref_source=embed&ref=share&embed=true`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              loading="lazy"
              className="w-full h-[400px] rounded border border-gray-700"
              title="Reddit Comments"
            ></iframe>

            <button
              onClick={() => setLightboxPost(null)}
              className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full px-3 py-1 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
