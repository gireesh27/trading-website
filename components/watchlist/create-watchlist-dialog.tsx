"use client";

import { useState } from "react";
import { useWatchlist } from "@/contexts/watchlist-context";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // If you use className utility

export function CreateWatchlistDialog({ trigger }: { trigger: React.ReactNode }) {
  const { createWatchlist } = useWatchlist();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6"); // Default blue
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createWatchlist(name.trim());
      toast({
        title: "✅ Watchlist Created",
        description: `"${name}" has been successfully added.`,
      });
      setName("");
      setDescription("");
      setColor("#3b82f6");
      setOpen(false);
    } catch (err: any) {
      toast({
        title: "❌ Creation Failed",
        description: err.message || "Could not create watchlist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Watchlist</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-sm text-gray-300">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tech Stocks"
              className="bg-gray-700 border-gray-600 text-white mt-1"
              autoFocus
            />
          </div>

          <div>
            <Label className="text-sm text-gray-300">Description (optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description..."
              className="bg-gray-700 border-gray-600 text-white mt-1"
            />
          </div>

          <div>
            <Label className="text-sm text-gray-300 mb-1 block">Color Tag</Label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-full rounded bg-gray-700 border-gray-600 cursor-pointer"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
