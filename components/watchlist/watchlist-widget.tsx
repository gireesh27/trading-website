"use client"

import React, { useState } from 'react';
import { useWatchlist } from '@/contexts/watchlist-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '../ui/use-toast';

export function WatchlistWidget() {
  const {
    activeWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isLoading,
    error,
  } = useWatchlist();
  const [newSymbol, setNewSymbol] = useState('');
  const { toast } = useToast();

  const handleAddSymbol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim() || !activeWatchlist) return;

    await addToWatchlist(activeWatchlist.id, newSymbol.trim());
    
    if (error) {
        toast({
            title: "Error",
            description: error,
            variant: "destructive"
        })
    } else {
        toast({
            title: "Success",
            description: `${newSymbol.toUpperCase()} added to your watchlist.`
        })
        setNewSymbol('');
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Watchlist</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddSymbol} className="flex items-center gap-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Add symbol (e.g., AAPL)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <Button type="submit" size="icon" disabled={isLoading}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activeWatchlist && activeWatchlist.items.length > 0 ? (
            activeWatchlist.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                <Link href={`/trade/${item.symbol.toLowerCase()}`} className="flex-grow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-white">{item.symbol}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[120px]">{item.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-white">${item.price?.toFixed(2) || 'N/A'}</p>
                            <p className={`text-xs ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {item.change >= 0 ? '+' : ''}{item.change?.toFixed(2) || '0.00'} ({item.changePercent?.toFixed(2) || '0.00'}%)
                            </p>
                        </div>
                    </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-gray-400 hover:text-red-500"
                  onClick={() => removeFromWatchlist(activeWatchlist.id, item.symbol)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Your watchlist is empty.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
