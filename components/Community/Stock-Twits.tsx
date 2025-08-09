"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

function decodeHtml(html: string) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

interface StockTwitsMessage {
  id: number;
  body: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string;
    followers: number;
    official: boolean;
  };
  symbols: { symbol: string; title: string }[];
  links: { url: string; title?: string }[];
  entities: {
    media: { url: string }[];
  };
}

export default function StockTwitsTrendingFeed() {
  const [messages, setMessages] = useState<StockTwitsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/stock-twits")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch trending messages");
        return res.json();
      })
      .then((data) => setMessages(data.messages))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-400">Loading trending messages...</p>
    );
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!messages.length)
    return (
      <p className="text-center text-gray-400">No trending messages found.</p>
    );

  return (
    <ScrollArea className="h-[600px] p-4 rounded-lg border border-gray-700 bg-gray-900">
      <div className="space-y-6">
        {messages.map((msg) => (
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-xl rounded-xl border border-gray-700">
            <CardHeader className="flex items-center gap-4 px-6 py-4">
              <Avatar className="w-14 h-14 border-2 border-blue-500">
                <AvatarImage
                  src={msg.user.avatar_url}
                  alt={msg.user.username}
                />
                <AvatarFallback>
                  {msg.user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CardTitle className="flex items-center gap-2 text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  {msg.user.username}
                  {msg.user.official && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className="text-blue-400 cursor-default"
                          >
                            Official
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Official Account</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-400 mt-1 font-medium">
                  Followers:{" "}
                  <span className="text-blue-400">{msg.user.followers}</span>
                </p>
              </div>
            </CardHeader>

            <CardContent className="px-6 py-4 text-gray-300 whitespace-pre-wrap leading-relaxed text-lg tracking-wide">
              {decodeHtml(msg.body)}
            </CardContent>

            {msg.symbols.length > 0 && (
              <div className="flex flex-wrap gap-3 px-6 pb-4">
                {msg.symbols.map((sym) => (
                  <Button
                    key={sym.symbol}
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-blue-400 hover:bg-blue-900"
                  >
                    <a
                      href={`https://stocktwits.com/symbol/${sym.symbol}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold"
                    >
                      #{sym.symbol} ({sym.title})
                    </a>
                  </Button>
                ))}
              </div>
            )}

            {msg.links && msg.links.length > 0 && (
              <div className="px-6 pb-4 space-y-2">
                {msg.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm block"
                  >
                    {link.title || link.url}
                  </a>
                ))}
              </div>
            )}

            {msg.entities.media.length > 0 && (
              <div className="px-6 pb-6 flex flex-col gap-4">
                {msg.entities.media.map((media, i) => (
                  <img
                    key={i}
                    src={media.url}
                    alt="media"
                    className="rounded-lg shadow-lg max-w-full object-contain"
                    loading="lazy"
                  />
                ))}
              </div>
            )}

            <div className="px-6 pb-3 text-right text-xs text-gray-500 italic">
              {new Date(msg.created_at).toLocaleString()}
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
