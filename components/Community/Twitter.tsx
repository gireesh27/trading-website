"use client";

import { useEffect, useState } from "react";

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
}

export default function TwitterFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTweets() {
      setLoading(true);
      try {
        const res = await fetch("/api/twitter");
        const json = await res.json();

        if (!res.ok) throw new Error(json.error?.title || "Failed to fetch tweets");

        setTweets(json.tweets || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTweets();
  }, []);

  if (loading) return <p>Loading tweets...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <div key={tweet.id} className="p-4 border border-gray-700 rounded-md bg-gray-900 text-white">
          <p>{tweet.text}</p>
          <p className="text-xs text-gray-400 mt-2">{new Date(tweet.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
