"use client";
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit2 } from "lucide-react";
import { useWatchlist } from "@/contexts/watchlist-context";

export function WatchlistTabs() {
  const { watchlists, activeWatchlist, setActiveWatchlist, createWatchlist } =
    useWatchlist();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState("");

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      createWatchlist(newWatchlistName.trim());
      setNewWatchlistName("");
      setShowCreateDialog(false);
    }
  };

  if (watchlists.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Tabs
        value={activeWatchlist?.id || ""}
        onValueChange={setActiveWatchlist}
        className="flex-1"
      >
        <TabsList className="bg-gray-700 p-1 h-auto">
          {watchlists.map((watchlist) => (
            <TabsTrigger
              key={watchlist.id}
              value={watchlist.id}
              className="text-xs px-3 py-1 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
            >
              {watchlist.name}
              {watchlist.items.length > 0 && (
                <span className="ml-1 text-gray-400">
                  ({watchlist.items.length})
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-1"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-gray-800 border-gray-700 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">
              Create New Watchlist
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Watchlist name..."
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              onKeyPress={(e) => e.key === "Enter" && handleCreateWatchlist()}
              autoFocus
            />

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 border-gray-600 text-gray-300 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateWatchlist}
                disabled={!newWatchlistName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
