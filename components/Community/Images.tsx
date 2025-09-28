"use client";

import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
  "gaming",
];
const LIMIT = 24;

interface Props {
  searchTerm: string;
  sortOrder: "asc" | "desc";
}

// --- Loader Spinner ---
const Loader: React.FC = () => (
  <div className="flex items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-400" />
  </div>
);

// --- X Icon ---
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function RedditImageFeed({ searchTerm, sortOrder }: Props) {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<RedditPost[]>([]);
  const [page, setPage] = useState(1);
  const [subreddit, setSubreddit] = useState("CryptoCurrency");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [lightboxPost, setLightboxPost] = useState<RedditPost | null>(null);

  // --- Fetch posts ---
  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(
      `/api/reddit/images?subreddit=${subreddit}&page=${page}&limit=${LIMIT}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      })
      .then((data) => {
        setPosts(data.posts);
        setTotalPages(data.totalPages || 1);
      })
      .catch((e) => setError(e.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, [subreddit, page]);

  // reset page when subreddit changes
  useEffect(() => setPage(1), [subreddit]);

  // filter + sort
  useEffect(() => {
    let filtered = posts;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.selftext.toLowerCase().includes(term)
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
    <div className="p-6 lg:p-8 bg-slate-900 min-h-screen text-slate-100 max-w-7xl mx-auto">
      {/* Subreddit Selector */}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {SUBREDDITS.map((sub) => (
          <Button
            key={sub}
            size="sm"
            variant={subreddit === sub ? "default" : "outline"}
            onClick={() => setSubreddit(sub)}
            className={`
    rounded-full 
    font-semibold 
    px-4 
    py-1.5 
    transition 
    transform 
    duration-300 
    ease-in-out 
    select-none
    ${
      subreddit === sub
        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900"
        : "border border-slate-300 text-slate-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md"
    }
    hover:scale-105
    focus:outline-none 
    focus:ring-4 
    focus:ring-blue-300
  `}
          >
            r/{sub}
          </Button>
        ))}
      </div>
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 px-4 sm:px-0">
        <Button
          size="sm"
          variant="ghost"
          disabled={page === 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className={`
      rounded-full 
      px-5 
      py-2 
      font-semibold 
      transition 
      duration-300 
      ease-in-out 
      select-none
      ${
        page === 1 || loading
          ? "text-slate-400 cursor-not-allowed bg-transparent"
          : "text-blue-600 hover:text-white hover:bg-blue-600 shadow-md"
      }
      focus:outline-none 
      focus:ring-4 
      focus:ring-blue-300
    `}
        >
          &larr; Previous
        </Button>

        <p className="text-sm text-slate-400 select-none">
          Page <span className="font-semibold text-slate-200">{page}</span> of{" "}
          <span className="font-semibold text-slate-200">{totalPages}</span>
        </p>

        <Button
          size="sm"
          variant="ghost"
          disabled={page === totalPages || loading}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className={`
      rounded-full 
      px-5 
      py-2 
      font-semibold 
      transition 
      duration-300 
      ease-in-out 
      select-none
      ${
        page === totalPages || loading
          ? "text-slate-400 cursor-not-allowed bg-transparent"
          : "text-blue-600 hover:text-white hover:bg-blue-600 shadow-md"
      }
      focus:outline-none 
      focus:ring-4 
      focus:ring-blue-300
    `}
        >
          Next &rarr;
        </Button>
      </div>
      {/* Posts Grid */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
        {loading && (
          <div className="flex items-center justify-center h-64 col-span-full">
            <Loader />
          </div>
        )}
        {error && (
          <p className="text-center text-red-400 text-lg col-span-full">
            Error: {error}
          </p>
        )}
        {!loading && !error && filteredPosts.length === 0 && (
          <p className="text-center text-slate-400 text-lg col-span-full">
            No posts found.
          </p>
        )}

        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="relative mb-6 break-inside-avoid rounded-xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-sky-500/20 transition-all duration-500"
            onClick={() => setLightboxPost(post)}
          >
            <Image
              src={
                post.image ??
                "https://placehold.co/600x400/1e293b/94a3b8?text=No+Image"
              }
              alt={post.title}
              width={600}
              height={400}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-bold text-base text-white line-clamp-2 drop-shadow-md transition-transform group-hover:-translate-y-8">
                {post.title}
              </h3>
              <div className="mt-1 text-sm translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all text-slate-200">
                <p>u/{post.author}</p>
                <p>
                  {post.ups} ▲ •{" "}
                  {formatDistanceToNow(new Date(post.created_utc * 1000), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Lightbox */}
      {lightboxPost && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          tabIndex={-1}
          onClick={() => setLightboxPost(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setLightboxPost(null);
          }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[9999] animate-fade-in cursor-pointer"
        >
          <div
            className="relative bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto cursor-auto shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
            tabIndex={0}
          >
            <div className="p-6">
              <h2
                id="lightbox-title"
                className="text-white text-2xl mb-4 font-bold leading-tight"
              >
                {lightboxPost.title}
              </h2>
              <div className="relative w-full h-[60vh] mb-4 bg-black rounded-md overflow-hidden">
                <Image
                  src={lightboxPost.image ?? "/placeholder.png"}
                  alt={lightboxPost.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <p className="text-slate-400 mb-4 text-sm font-medium">
                Comments from Reddit:
              </p>
              <iframe
                src={`https://www.redditmedia.com${lightboxPost.permalink}?ref_source=embed&ref=share&embed=true&theme=dark`}
                loading="lazy"
                className="w-full h-[400px] rounded border border-slate-700 bg-slate-900"
                title="Reddit Comments"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
            <button
              onClick={() => setLightboxPost(null)}
              aria-label="Close lightbox"
              className="absolute top-4 right-4 bg-slate-700/50 hover:bg-slate-600/80 text-white rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <XIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
