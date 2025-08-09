"use client";

import { useEffect, useState, useRef } from "react";

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
}

const allowedQueries = [
  "trading",
  "crypto",
  "forex",
  "stocks",
  "bitcoin",
  "ethereum",
  "options",
  "investing",
  "wallstreetbets",
  "nifty",
];

export default function TwitterFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeQuery, setActiveQuery] = useState("trading");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchTweets();
    }, 300); // wait 300ms after last toggle

    async function fetchTweets() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/twitter?query=${activeQuery}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.error?.title || "Failed to fetch tweets");

        setTweets(json.tweets || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    // cleanup debounce on unmount
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [activeQuery]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {allowedQueries.map((q) => (
          <button
            key={q}
            onClick={() => setActiveQuery(q)}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              activeQuery === q
                ? "bg-blue-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            {q.charAt(0).toUpperCase() + q.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p>Loading tweets...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="space-y-4">
        {tweets.map((tweet) => (
          <div
            key={tweet.id}
            className="p-4 border border-gray-700 rounded-md bg-gray-900 text-white"
          >
            <p>{tweet.text}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(tweet.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
