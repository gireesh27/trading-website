"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { stockApi } from "@/lib/api/stock-api";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useOrders } from "@/contexts/order-context";
import { Loader2, XCircle, Zap } from "lucide-react";
import { toast } from "react-toastify";
// --- TYPES ---
type OrderType = "market" | "limit" | "stop";
type SectorType = "Markets" | "crypto";
interface SymbolSuggestion {
  symbol: string;
  name: string;
}
interface StockData {
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  sector: SectorType;
}

// --- COMPONENT ---
export function QuickTrade() {
  const { user } = useAuth();
  const { placeOrder, cancelOrder, isLoading, getOpenOrders } = useOrders();

  // --- STATE MANAGEMENT ---
  const [sector, setSector] = useState<SectorType>("Markets");
  const [symbol, setSymbol] = useState<string | null>(null);
  const [symbolInput, setSymbolInput] = useState("");
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [suggestions, setSuggestions] = useState<SymbolSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- DATA FETCHING ---
  const fetchStockData = useCallback(
    async (selectedSymbol: string, selectedSector: SectorType) => {
      if (!selectedSymbol) return;

      setIsFetchingPrice(true);
      setStockData(null);

      try {
        let res;

        // Fetch from the correct endpoint based on the selected sector
        if (selectedSector === "Markets") {
          res = await fetch(`/api/stocks/quote?symbol=${selectedSymbol}`);
        } else if (selectedSector === "crypto") {
          res = await fetch(`/api/crypto/quote?symbol=${selectedSymbol}`);
        }

        if (!res || !res.ok) {
          throw new Error("Symbol not found or unavailable");
        }

        const data = await res.json();

        setStockData({
          name: data.name || selectedSymbol,
          currentPrice: data.price,
          change: data.change ?? (Math.random() - 0.5) * 20,
          changePercent: data.changePercent ?? (Math.random() - 0.5) * 5,
          sector: selectedSector,
        });

        setPrice(data.price.toString());

        // Optional success/info toast
        toast.success(`Loaded ${selectedSymbol} data successfully`);
      } catch (err: any) {
        console.error(err);
        setStockData(null);
        setSymbol(null);

        toast.error(`Failed to load data for ${selectedSymbol}: ${err.message}`);
      } finally {
        setIsFetchingPrice(false);
      }
    },
    []
  );


  // --- EFFECTS ---
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const trimmed = symbolInput.trim();
      if (trimmed.length < 1) {
        setSuggestions([]);
        return;
      }
      try {
        // You could pass the `sector` to your search API if needed
        // const results = await stockApi.searchSymbol(trimmed, sector);
        const results = await stockApi.searchSymbol(trimmed);
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [symbolInput, sector]);

  // --- HANDLERS ---
  const handleSymbolSelect = async (selectedSymbol: string) => {
    const upperSymbol = selectedSymbol.toUpperCase();
    setSymbolInput(upperSymbol);
    setSymbol(upperSymbol);
    setShowSuggestions(false);
    // FIX: Pass the currently selected sector to the fetch function
    await fetchStockData(upperSymbol, sector);
  };

  const handleTrade = async (side: "buy" | "sell") => {
    if (!symbol || !stockData) {
      toast.error("No stock selected. Please choose a symbol before trading.");
      return;
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      toast.error("Enter a valid quantity greater than 0.");
      return;
    }

    try {
      await placeOrder({
        symbol,
        sector: stockData.sector,
        quantity: qty,
        price: orderType === "market" ? stockData.currentPrice : Number(price),
        type: side,
        orderType,
      });

      toast.success(
        `${side === "buy" ? "Buy" : "Sell"} order placed for ${qty} ${symbol}`
      );

      setQuantity("");
    } catch (err: any) {
      console.error("Trade error:", err);
      toast.error(`Failed to place order: ${err.message}`);
    }
  };

  // --- COMPUTED VALUES ---
  const calculateTotal = () => {
    if (!stockData) return "0.00";
    const qty = Number(quantity) || 0;
    const orderPrice = orderType === "market" ? stockData.currentPrice : Number(price) || 0;
    const subtotal = qty * orderPrice;
    const fees = subtotal * 0.001;
    return (subtotal + fees).toFixed(2);
  };

  const isTradeFormDisabled = !stockData || isFetchingPrice;
  const pendingOrders = symbol ? getOpenOrders().filter((o) => o.symbol === symbol) : [];
  const priceChangeColor = stockData && stockData.change >= 0 ? "text-green-400" : "text-rose-400";
  const priceGlowColor = stockData && stockData.change >= 0 ? "text-cyan-500" : "text-orange-500";

  // --- RENDER ---
  if (!user) {
    return (
      <Card className="bg-slate-900/60 backdrop-blur-xl border border-cyan-400/20 shadow-2xl shadow-black/40 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-center drop-shadow-sm tracking-wide bg-gradient-to-br from-slate-200 to-cyan-400 bg-clip-text text-transparent">
            Sign In Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-slate-400 mb-4">Please sign in to start trading.</p>
          <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-transform transform text-white font-semibold">
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900/60 backdrop-blur-xl border border-cyan-400/20 shadow-2xl shadow-black/40 rounded-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-50 group-hover:opacity-80 transition-opacity duration-500 z-0" />
        <div className="relative z-10">
          <CardHeader className="p-4 border-b border-slate-800">
            {!stockData && !isFetchingPrice && (
              <CardTitle className="flex items-center justify-center gap-2 text-xl font-bold bg-gradient-to-r from-slate-100 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
                <Zap className="text-cyan-300" />
                Quick Trade
              </CardTitle>
            )}
            {isFetchingPrice && (
              <div className="flex items-center gap-3 px-2">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                <span className="text-lg text-slate-300">Fetching {symbol}...</span>
              </div>
            )}
            {stockData && (
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                    {symbol}
                  </CardTitle>
                  <p className="text-sm text-slate-400">{stockData.name}</p>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-2xl text-white shadow-lg ${priceGlowColor}`}>
                    ₹{stockData.currentPrice.toFixed(2)}
                  </span>
                  <p className={`text-sm font-medium ${priceChangeColor}`}>
                    {stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-4 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <Label htmlFor="sector" className="text-xs text-slate-400 mb-1.5 block">Sector</Label>
                <Select value={sector} onValueChange={(v) => setSector(v as SectorType)}>
                  <SelectTrigger className="bg-slate-800/60 border-2 border-slate-700 rounded-lg h-11 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/30 transition-all text-white">
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="Markets">Markets</SelectItem>
                    <SelectItem value="Crypto">Crypto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 relative">
                <Label htmlFor="symbol" className="text-xs text-slate-400 mb-1.5 block">Symbol</Label>
                <Input
                  id="symbol"
                  placeholder={sector === 'Markets' ? "e.g., RELIANCE" : "e.g., BTC-USD"}
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value)}
                  className="h-11 text-white bg-slate-800/60 border-2 border-slate-700 rounded-lg focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/30 transition-all"
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => symbolInput && setShowSuggestions(true)}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-20 w-full bg-slate-900 border border-slate-700 rounded-md mt-1 max-h-52 overflow-y-auto shadow-lg backdrop-blur-lg">
                    {suggestions.map((s) => (
                      <div
                        key={s.symbol}
                        className="p-3 text-sm hover:bg-cyan-600/30 cursor-pointer transition-colors"
                        onMouseDown={() => handleSymbolSelect(s.symbol)}
                      >
                        <span className="font-bold text-slate-100">{s.symbol}</span> — <span className="text-slate-400">{s.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/80 rounded-lg p-1 h-11">
                <TabsTrigger value="buy" className="data-[state=active]:bg-green-600/80 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md transition-all">Buy</TabsTrigger>
                <TabsTrigger value="sell" className="data-[state=active]:bg-red-600/80 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md transition-all">Sell</TabsTrigger>
              </TabsList>

              <div className={`mt-4 space-y-4 transition-opacity duration-300 ${isTradeFormDisabled ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Order Type</Label>
                    <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)} disabled={isTradeFormDisabled}>
                      <SelectTrigger className="bg-slate-800/60 border-2 text-white border-slate-700 rounded-lg focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/30 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700 text-white">
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                        <SelectItem value="stop">Stop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Quantity</Label>
                    <Input type="number" placeholder="0.00" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-slate-800/60 border-2 text-white border-slate-700 rounded-lg focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/30 transition-all" disabled={isTradeFormDisabled} />
                  </div>
                </div>

                {orderType !== "market" && (
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">{orderType === 'limit' ? 'Limit Price' : 'Stop Price'}</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-slate-800/60 border-2 border-slate-700 rounded-lg focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/30 transition-all text-white" disabled={isTradeFormDisabled} />
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-300 pt-3 border-t border-slate-700/50">
                  <span className="font-medium">Estimated Total:</span>
                  <span className="font-bold text-lg text-white">₹{calculateTotal()}</span>
                </div>

                <TabsContent value="buy" className="mt-0">
                  <Button onClick={() => handleTrade("buy")} disabled={isTradeFormDisabled || !quantity || isLoading} className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 font-bold hover:scale-105 transition-transform transform">
                    {isLoading ? <Loader2 className="animate-spin" /> : `Buy ${symbol || ''}`}
                  </Button>
                </TabsContent>
                <TabsContent value="sell" className="mt-0">
                  <Button onClick={() => handleTrade("sell")} disabled={isTradeFormDisabled || !quantity || isLoading} className="w-full h-12 text-lg bg-red-600 hover:bg-red-700 font-bold hover:scale-105 transition-transform transform">
                    {isLoading ? <Loader2 className="animate-spin" /> : `Sell ${symbol || ''}`}
                  </Button>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </div>
      </Card>

      {pendingOrders.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Pending Orders for {symbol}</h3>
          <div className="flex flex-wrap gap-2">
            {pendingOrders.map((order) => (
              <Badge
                key={order._id}
                variant="outline"
                className={`flex items-center gap-2 p-2 rounded-md text-xs ${order.type === 'buy' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}`}
              >
                {order.type.toUpperCase()} {order.quantity} @ ₹{order.price?.toFixed(2)}
                <button onClick={() => cancelOrder(order._id)} className="ml-1 text-slate-500 hover:text-white transition-colors">
                  <XCircle size={14} />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
