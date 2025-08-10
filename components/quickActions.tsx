"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface Stock {
  symbol: string;
  name: string;
  price: number;
}

export function QuickActions() {
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [isLoading, setIsLoading] = useState(false);
  const [quickTrade, setQuickTrade] = useState({
    symbol: "",
    quantity: "",
    orderType: "market",
  });

  const [popularStocks, setPopularStocks] = useState<Stock[]>([
    { symbol: "AAPL", name: "Apple Inc.", price: 0 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 0 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 0 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 0 },
  ]);

  const fetchPopularStockPrices = async () => {
    try {
      const symbols = popularStocks.map((stock) => stock.symbol).join(",");
      const res = await fetch(`/api/stocks/quote?symbols=${encodeURIComponent(symbols)}`);
      if (!res.ok) throw new Error("Failed to fetch stock quotes");
      const data = await res.json();

      // Expecting data to be an array of objects: [{ symbol, price, name }]
      if (Array.isArray(data)) {
        setPopularStocks((prevStocks) =>
          prevStocks.map((stock) => {
            const fresh = data.find(
              (d: any) => d.symbol.toUpperCase() === stock.symbol.toUpperCase()
            );
            return fresh
              ? { ...stock, price: Number(fresh.price) }
              : stock;
          })
        );
      }
    } catch (err: any) {
      console.error("Error fetching popular stock prices:", err);
      toast({
        title: "Error",
        description: "Could not load popular stock prices.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPopularStockPrices();
    // Optional: refresh prices every 60s
    const interval = setInterval(fetchPopularStockPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const executeQuickTrade = async () => {
    const { symbol, quantity, orderType } = quickTrade;
    const qty = Number.parseFloat(quantity);

    if (!symbol || qty <= 0) {
      toast({
        title: "Invalid input",
        description: "Please provide valid symbol and quantity.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/trading/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          quantity: qty,
          price: 0, // backend handles market order price
          type: tradeType,
          orderType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Trade failed");

      toast({
        title: "Trade Placed",
        description: `${tradeType.toUpperCase()} ${symbol.toUpperCase()} x${qty} successful.`,
      });

      setQuickTrade({ symbol: "", quantity: "", orderType: "market" });
      setIsTradeDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Trade Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openTradeDialog = (type: "buy" | "sell", symbol?: string) => {
    setTradeType(type);
    setQuickTrade((prev) => ({
      ...prev,
      symbol: symbol || "",
    }));
    setIsTradeDialogOpen(true);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Trade Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Dialog open={isTradeDialogOpen} onOpenChange={setIsTradeDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => openTradeDialog("buy")}
                className="bg-green-600 hover:bg-green-700 text-white h-12"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Quick Buy
              </Button>
            </DialogTrigger>

            <DialogTrigger asChild>
              <Button
                onClick={() => openTradeDialog("sell")}
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white h-12"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Quick Sell
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center space-x-2">
                  {tradeType === "buy" ? (
                    <ArrowUpRight className="h-5 w-5 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-400" />
                  )}
                  <span>
                    Quick {tradeType.charAt(0).toUpperCase() + tradeType.slice(1)}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="symbol" className="text-gray-300">
                    Symbol
                  </Label>
                  <Input
                    id="symbol"
                    placeholder="e.g., AAPL"
                    value={quickTrade.symbol}
                    onChange={(e) =>
                      setQuickTrade((prev) => ({
                        ...prev,
                        symbol: e.target.value.toUpperCase(),
                      }))
                    }
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity" className="text-gray-300">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Number of shares"
                    value={quickTrade.quantity}
                    onChange={(e) =>
                      setQuickTrade((prev) => ({ ...prev, quantity: e.target.value }))
                    }
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="orderType" className="text-gray-300">
                    Order Type
                  </Label>
                  <Select
                    value={quickTrade.orderType}
                    onValueChange={(value) =>
                      setQuickTrade((prev) => ({ ...prev, orderType: value }))
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="market">Market Order</SelectItem>
                      <SelectItem value="limit">Limit Order</SelectItem>
                      <SelectItem value="stop">Stop Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={executeQuickTrade}
                    disabled={isLoading}
                    className={`flex-1 ${
                      tradeType === "buy"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {isLoading ? "Processing..." : `${tradeType === "buy" ? "Buy" : "Sell"} ${
                      quickTrade.symbol
                    }`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsTradeDialogOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Popular Stocks */}
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Popular Stocks</span>
          </h3>
          <div className="space-y-2">
            {popularStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div>
                  <div className="text-white font-semibold text-sm">{stock.symbol}</div>
                  <div className="text-gray-400 text-xs">{stock.name}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm">${stock.price.toFixed(2)}</span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      onClick={() => openTradeDialog("buy", stock.symbol)}
                      className="bg-green-600 hover:bg-green-700 h-6 px-2 text-xs"
                    >
                      Buy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openTradeDialog("sell", stock.symbol)}
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white h-6 px-2 text-xs"
                    >
                      Sell
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
