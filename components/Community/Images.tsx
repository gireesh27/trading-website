"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";

interface RedditPost {
  id: string;
  title: string;
  author: string;
  url: string;
  image: string;
  ups: number;
  selftext: string;
  created_utc: number;
  permalink: string;
}

export default function RedditImageFeed() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lightboxPost, setLightboxPost] = useState<RedditPost | null>(null);
  const [subreddit, setSubreddit] = useState("algotrading");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reddit/images/?subreddit=${subreddit}&limit=50`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      })
      .then((data) => {
        setPosts(data.posts);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [subreddit]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="mb-6 flex gap-4">
        {[
          "StockMarket",
          "CryptoCurrency",
          "technology",
          "Daytrading",
          "ETFs",
        ].map((sub) => (
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

      {loading && <p>Loading posts...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div
        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
        style={{ columnFill: "balance" }}
      >
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative mb-4 break-inside rounded-lg overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setLightboxPost(post)}
          >
            <div className="relative w-full aspect-[4/3]">
              {post.image ? (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover rounded-lg group-hover:brightness-90 transition"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              ) : // Optional: fallback UI or empty fragment
              null}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
              <h3 className="font-semibold text-sm line-clamp-2">
                {post.title}
              </h3>
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
            <h2 className="text-white text-xl mb-4 font-bold">
              {lightboxPost.title}
            </h2>
            <div className="relative w-full h-[60vh] mb-4">
              <Image
                src={lightboxPost.image}
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
