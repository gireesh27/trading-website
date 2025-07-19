"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useMemo } from "react";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { useTrading, OrderBookEntry } from "@/contexts/trading-context";

interface OrderBookProps {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export function OrderBook({ symbol, bids, asks }: OrderBookProps) {
  const { selectedStock } = useMarketData();
  const { bids: tradingBids, asks: tradingAsks } = useTrading();

  const maxTotal = useMemo(() => {
    const allEntries = [...bids, ...asks];
    if (allEntries.length === 0) return 1;
    return Math.max(...allEntries.map(entry => entry.total));
  }, [bids, asks]);

  const renderOrderRow = (order: OrderBookEntry, type: 'bid' | 'ask') => {
    const barWidth = (order.total / maxTotal) * 100;
    const colorClass = type === 'bid' ? 'bg-green-500/20' : 'bg-red-500/20';
    const priceColorClass = type === 'bid' ? 'text-green-400' : 'text-red-400';

    return (
      <div key={`${type}-${order.price}-${order.quantity}`} className="relative px-4 py-1 hover:bg-gray-700 transition-colors text-xs font-mono">
        <div className={`absolute top-0 bottom-0 left-0 ${colorClass}`} style={{ width: `${barWidth}%` }}></div>
        <div className="relative grid grid-cols-3 gap-4">
          <span className={priceColorClass}>{order.price.toFixed(2)}</span>
          <span className="text-right text-gray-300">{order.quantity.toFixed(4)}</span>
          <span className="text-right text-gray-300">{order.total.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Order Book
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          <div className="px-4 py-2 bg-gray-900/50">
            <div className="grid grid-cols-3 gap-4 text-xs font-medium text-gray-400">
              <span>Price (USD)</span>
              <span className="text-right">Quantity</span>
              <span className="text-right">Total</span>
            </div>
          </div>

          {/* Asks */}
          <div>
            {asks.length > 0 ? (
              [...asks].reverse().map((ask) => renderOrderRow(ask, 'ask'))
            ) : (
              <div className="text-center text-gray-500 py-4 text-xs">No sell orders</div>
            )}
          </div>

          {/* Last Price */}
          <div className="px-4 py-3 bg-gray-900/50 border-y border-gray-700">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                ${selectedStock?.price?.toFixed(2) || "0.00"}
              </div>
              <div className="text-xs text-gray-400">Last Price</div>
            </div>
          </div>

          {/* Bids */}
          <div>
            {bids.length > 0 ? (
              bids.map((bid) => renderOrderRow(bid, 'bid'))
            ) : (
              <div className="text-center text-gray-500 py-4 text-xs">No buy orders</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
