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

const SUBREDDITS = ["CryptoCurrency", "technology", "Daytrading", "ETFs", "gaming"];

const LIMIT = 24;

interface Props {
  searchTerm: string;
  sortOrder: "asc" | "desc";
}

// A simple self-contained Loader component to replace the external import
const Loader = () => (
  <div className="flex justify-center items-center" aria-label="Loading content">
    <Loader/>
  </div>
);

// A simple X icon component for the modal close button
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
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

  // --- Data fetching and filtering logic (unchanged) ---
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
      .catch((e: any) => setError(e.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, [subreddit, page]);

  useEffect(() => {
    setPage(1);
  }, [subreddit]);

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
  // --- End of logic ---

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-900 min-h-screen text-slate-100 max-w-7xl mx-auto">
      {/* Subreddit selector with improved styling */}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {SUBREDDITS.map((sub) => (
          <Button
            key={sub}
            size="sm"
            variant={subreddit === sub ? "default" : "outline"}
            onClick={() => setSubreddit(sub)}
            className={`
              rounded-full font-semibold transition-all duration-300 ease-in-out transform hover:scale-105
              ${subreddit === sub
                ? ' text-white shadow-lg ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900'
                : 'text-slate-300 border-slate-700  hover:text-white'
              }
            `}
          >
            r/{sub}
          </Button>
        ))}
      </div>

      {/* Pagination controls with better visibility */}
      <div className="flex justify-between items-center mb-6 px-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={page === 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="hover:bg-slate-800 disabled:opacity-40"
        >
          &larr; Previous
        </Button>
        <p className="text-sm text-slate-400">
          Page <span className="font-semibold text-slate-200">{page}</span> of{" "}
          <span className="font-semibold text-slate-200">{totalPages}</span>
        </p>
        <Button
          size="sm"
          variant="ghost"
          disabled={page === totalPages || loading}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="hover:bg-slate-800 disabled:opacity-40"
        >
          Next &rarr;
        </Button>
      </div>

      {/* Posts grid container */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
        {/* Loading, Error, and No Posts states are handled centrally to avoid layout shifts */}
        {(loading || error || (filteredPosts.length === 0 && !loading)) && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900/50 z-10 col-span-full">
            {loading && <Loader />}
            {error && <p className="text-center text-red-400 text-lg">Error: {error}</p>}
            {filteredPosts.length === 0 && !loading && !error && (
              <p className="text-center text-slate-400 text-lg">No posts found.</p>
            )}
          </div>
        )}

        {/* --- STYLED POST CARD --- */}
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="relative mb-6 break-inside-avoid rounded-xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-sky-500/20 transition-all duration-500 ease-in-out"
            onClick={() => setLightboxPost(post)}
            title={post.title}
          >
            {/* Replaced next/image with standard <img> tag */}
            <Image
              src={post.image ?? "https://placehold.co/600x400/1e293b/94a3b8?text=No+Image"}
              alt={post.title}
              width={600}
              height={800}
           
              className="w-full h-auto object-cover transition-all duration-500 ease-in-out group-hover:scale-105 group-hover:brightness-75"
            />

            {/* Overlay Container: This holds the text and provides a dark gradient for readability. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Text Container: Positioned at the bottom, overflows hidden to create the slide-up effect */}
            <div className="absolute bottom-0 left-0 right-0 p-4 overflow-hidden">
              {/* Heading: Always visible, but smoothly translates upward on hover to make space for the subheading. */}
              <h3 className="font-bold text-base text-white line-clamp-2 drop-shadow-md transform transition-transform duration-300 ease-in-out group-hover:-translate-y-8">
                {post.title}
              </h3>

              {/* Subheading: Hidden by default. On hover, it gracefully slides up from below and fades into view. */}
              <div className="text-sm transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-in-out text-slate-200 mt-1">
                <p>u/{post.author}</p>
                <p>{post.ups} ▲ • {" "}
                {formatDistanceToNow(new Date(post.created_utc * 1000), {
                  addSuffix: true,
                })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- STYLED LIGHTBOX MODAL --- */}
      {lightboxPost && (
        <div
          onClick={() => setLightboxPost(null)}
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[9999] cursor-pointer animate-fade-in"
        >
          <div
            className="relative bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto cursor-auto shadow-2xl shadow-sky-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-white text-2xl mb-4 font-bold leading-tight">
                {lightboxPost.title}
              </h2>
              <div className="relative w-full h-[60vh] mb-4 bg-black rounded-md overflow-hidden">
                {/* Replaced next/image with standard <img> tag */}
                <img
                  src={lightboxPost.image ?? "/placeholder.png"}
                  alt={lightboxPost.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-slate-400 mb-4 text-sm">Comments from Reddit:</p>
              <iframe
                src={`https://www.redditmedia.com${lightboxPost.permalink}?ref_source=embed&ref=share&embed=true&theme=dark`}
                loading="lazy"
                className="w-full h-[400px] rounded border border-slate-700 bg-slate-900"
                title="Reddit Comments"
              ></iframe>
            </div>
            <button
              onClick={() => setLightboxPost(null)}
              className="absolute top-4 right-4 bg-slate-700/50 hover:bg-slate-600/80 text-white rounded-full p-2 transition-colors"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}

