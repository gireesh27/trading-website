"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BentoGrid } from "@/components/ui/bento-grid";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import Image from "next/image";
import Link from "next/link";
import Loader from "../loader";

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
  entities: { media: { url: string }[] };
}

interface Props {
  searchTerm: string;
  sortOrder: "asc" | "desc";
}

export default function StockTwitsTrendingFeed({ searchTerm, sortOrder }: Props) {
  const [messages, setMessages] = useState<StockTwitsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch("/api/stock-twits")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch trending messages");
        return res.json();
      })
      .then((data) => setMessages(data.messages))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredAndSortedMessages = useMemo(() => {
    let filtered = messages;

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.body.toLowerCase().includes(lower) ||
          msg.user.username.toLowerCase().includes(lower) ||
          msg.symbols.some((s) => s.symbol.toLowerCase().includes(lower))
      );
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [messages, searchTerm, sortOrder]);

  if (loading) return <Loader />;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (filteredAndSortedMessages.length === 0)
    return <p className="text-center text-gray-400">No trending messages found.</p>;

  return (
    <ScrollArea className="mx-auto p-4 rounded-lg border border-gray-700 bg-gray-900">
      <BentoGrid className="gap-6">
        {filteredAndSortedMessages.map((msg) => (
          <Card
            key={msg.id}
            className="relative bg-gray-900 shadow-2xl rounded-2xl overflow-hidden border border-gray-700 hover:scale-[1.01] transition-transform duration-300"
          >
            {/* Background Media Image */}
            {msg.entities.media[0]?.url && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={msg.entities.media[0].url}
                  alt="background media"
                  className="object-cover w-full h-full opacity-30"
                  fill
                  priority={false}
                />
              </div>
            )}

            {/* Avatar Top-Left */}
            <div className="absolute top-4 left-4 z-10">
              <Avatar className="w-14 h-14 border-2 border-blue-500 shadow-md">
                <AvatarImage src={msg.user.avatar_url || ""} alt={msg.user.username} />
                <AvatarFallback>{msg.user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>

            {/* Username Center Top */}
            <div className="flex justify-center pt-6 z-10 relative">
              <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 flex items-center gap-2">
                {msg.user.username}
                {msg.user.official && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="text-blue-400 cursor-default">
                          Official
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>Official Account</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </h2>
            </div>

            {/* Followers */}
            <div className="flex justify-center mt-1 z-10 relative">
              <p className="text-sm text-gray-300 font-medium">
                Followers: <span className="text-blue-400">{msg.user.followers}</span>
              </p>
            </div>

            {/* Description */}
            <CardContent className="relative z-10 text-center px-6 py-8 text-gray-200 whitespace-pre-wrap overflow-hidden text-ellipsis max-h-64 leading-relaxed text-lg">
              {decodeHtml(msg.body)}
            </CardContent>

            {/* Symbols */}
            {msg.symbols.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 px-6 pb-4 z-10 relative">
                {msg.symbols.map((sym) => (
                  <Button
                    key={sym.symbol}
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-blue-400 hover:bg-blue-900 hover:text-white transition-colors duration-200"
                  >
                    <Link
                      href={`https://stocktwits.com/symbol/${sym.symbol}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      #{sym.symbol} ({sym.title})
                    </Link>
                  </Button>
                ))}
              </div>
            )}

            {/* Links */}
            {msg.links && msg.links.length > 0 && (
              <div className="px-6 pb-4 space-y-2 z-10 relative text-center">
                {msg.links.map((link, i) => (
                  <Link
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-500 hover:underline transition-colors duration-200 text-sm block"
                  >
                    {link.title || link.url}
                  </Link>
                ))}
              </div>
            )}

            {/* Timestamp */}
            <div className="px-6 pb-3 text-center text-xs text-gray-400 italic z-10 relative">
              {new Date(msg.created_at).toLocaleString()}
            </div>
          </Card>
        ))}
      </BentoGrid>
    </ScrollArea>
  );
}
