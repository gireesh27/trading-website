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
import { Loader2 } from "lucide-react"; // For loading spinner

// --- TYPES ---
type OrderType = "market" | "limit" | "stop";
type SectorType = "Markets" | "crypto" ;
interface SymbolSuggestion {
  symbol: string;
  name: string;
}
interface StockData {
  name: string;
  currentPrice: number;
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
  const fetchStockData = useCallback(async (selectedSymbol: string) => {
    if (!selectedSymbol) return;
    setIsFetchingPrice(true);
    setStockData(null); // Reset previous data
    try {
      // NOTE: You might need to adjust the API endpoint based on the sector
      const res = await fetch(`/api/stocks/quote?symbol=${selectedSymbol}`);
      if (!res.ok) throw new Error("Symbol not found");
      const data = await res.json();
      setStockData({ name: data.name, currentPrice: data.price });
      setPrice(data.price.toString()); // Pre-fill price for limit orders
    } catch (err) {
      console.error(err);
      setStockData(null);
      setSymbol(null); // Clear symbol on error
    } finally {
      setIsFetchingPrice(false);
    }
  }, []);

  // --- EFFECTS ---
  // Debounced effect for fetching symbol suggestions
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const trimmed = symbolInput.trim();
      if (trimmed.length < 1) {
        setSuggestions([]);
        return;
      }
      try {
        // NOTE: You could pass the `sector` to your search API if needed
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
    await fetchStockData(upperSymbol);
  };

  const handleTrade = async (side: "buy" | "sell", sector: SectorType) => {
    if (!symbol || !stockData) return;
    const qty = Number(quantity);
    if (qty <= 0) return;

    await placeOrder({
      symbol,
      sector,
      quantity: qty,
      price: orderType === "market" ? stockData.currentPrice : Number(price),
      type: side,
      orderType,
    });
    setQuantity(""); // Reset quantity after trade
  };

  // --- COMPUTED VALUES ---
  const calculateTotal = () => {
    if (!stockData) return "0.00";
    const qty = Number(quantity) || 0;
    const orderPrice = orderType === "market" ? stockData.currentPrice : Number(price) || 0;
    // Example fee calculation, adjust as needed
    const subtotal = qty * orderPrice;
    const fees = subtotal * 0.001; 
    return (subtotal + fees).toFixed(2);
  };
  
  const isTradeFormDisabled = !stockData || isFetchingPrice;
  const pendingOrders = symbol ? getOpenOrders().filter((o) => o.symbol === symbol) : [];

  // --- RENDER ---
  if (!user) {
    return (
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl  drop-shadow-sm tracking-wide bg-gradient-to-br from-slate-200 to-cyan-400 bg-clip-text text-transparent">Sign In Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">Please sign in to start trading.</p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900/70 backdrop-blur-sm border border-gray-700 shadow-2xl shadow-black/30 text-white rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-900/50 p-4 border-b border-gray-700 ">
          {!stockData && !isFetchingPrice && (
             <CardTitle className="text-xl font-bold  drop-shadow-sm tracking-wide bg-gradient-to-br from-slate-200 to-cyan-400 bg-clip-text text-transparent">Quick Trade</CardTitle>
          )}
          {isFetchingPrice && (
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              <span className="text-lg text-gray-300">Fetching {symbol}...</span>
            </div>
          )}
          {stockData && (
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {symbol}
                </CardTitle>
                <p className="text-sm text-gray-400">{stockData.name}</p>
              </div>
              <div className="text-right">
                <span className="text-green-400 font-bold text-2xl">
                  ${stockData.currentPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4 space-y-6">
          {/* --- Symbol & Sector Selection --- */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <Label htmlFor="sector" className="text-xs text-gray-400 mb-2 block">Sector</Label>
              <Select value={sector} onValueChange={(v) => setSector(v as SectorType)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 rounded-lg h-11">
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="Markets">Markets</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 relative">
               <Label htmlFor="symbol" className="text-xs text-gray-400 mb-2 block">Symbol</Label>
               <Input
                 id="symbol"
                 placeholder={sector === 'Markets' ? "e.g., AAPL" : "e.g., BTC-USD"}
                 value={symbolInput}
                 onChange={(e) => setSymbolInput(e.target.value)}
                 className="pl-3 pr-3 bg-gray-800 border-gray-700 rounded-lg h-11"
                 onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                 onFocus={() => symbolInput && setShowSuggestions(true)}
               />
               {showSuggestions && suggestions.length > 0 && (
                 <div className="absolute z-20 w-full bg-gray-900 border border-gray-700 rounded-md mt-1 max-h-52 overflow-y-auto shadow-lg">
                   {suggestions.map((s) => (
                     <div
                       key={s.symbol}
                       className="p-3 text-sm hover:bg-blue-600/30 cursor-pointer transition-colors duration-150"
                       onMouseDown={() => handleSymbolSelect(s.symbol)} // Use onMouseDown to fire before blur
                     >
                       <span className="font-bold">{s.symbol}</span> — <span className="text-gray-400">{s.name}</span>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>

          {/* --- Trade Execution --- */}
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 rounded-lg p-1">
              <TabsTrigger value="buy" className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md">Buy</TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md">Sell</TabsTrigger>
            </TabsList>

            {/* --- Shared Trade Form --- */}
            <div className={`mt-4 space-y-4 transition-opacity duration-300 ${isTradeFormDisabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-400">Order Type</Label>
                    <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)} disabled={isTradeFormDisabled}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 rounded-lg mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="market">Market</SelectItem>
                          <SelectItem value="limit">Limit</SelectItem>
                          <SelectItem value="stop">Stop</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Quantity</Label>
                     <Input
                        type="number"
                        placeholder="0.00"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="bg-gray-800 border-gray-700 rounded-lg mt-1"
                        disabled={isTradeFormDisabled}
                      />
                  </div>
                </div>

                {orderType !== "market" && (
                    <div>
                      <Label className="text-xs text-gray-400">{orderType === 'limit' ? 'Limit Price' : 'Stop Price'}</Label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-gray-800 border-gray-700 rounded-lg mt-1"
                        disabled={isTradeFormDisabled}
                      />
                    </div>
                )}
                
                <div className="flex justify-between items-center text-gray-300 pt-2 border-t border-gray-700/50">
                    <span className="font-medium">Estimated Total:</span>
                    <span className="font-bold text-lg text-white">${calculateTotal()}</span>
                </div>
              
                {/* --- Buy/Sell Buttons --- */}
                <TabsContent value="buy">
                  <Button onClick={() => handleTrade("buy",sector)} disabled={isTradeFormDisabled || !quantity || isLoading} className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 font-bold">
                    {isLoading ? <Loader2 className="animate-spin" /> : `Buy ${symbol || ''}`}
                  </Button>
                </TabsContent>
                <TabsContent value="sell">
                  <Button onClick={() => handleTrade("sell",sector)} disabled={isTradeFormDisabled || !quantity || isLoading} className="w-full h-12 text-lg bg-red-600 hover:bg-red-700 font-bold">
                     {isLoading ? <Loader2 className="animate-spin" /> : `Sell ${symbol || ''}`}
                  </Button>
                </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* --- Pending Orders Display --- */}
      {pendingOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Pending Orders for {symbol}</h3>
          <div className="flex flex-wrap gap-2">
            {pendingOrders.map((order) => (
              <Badge
                key={order._id}
                variant={order.type === "buy" ? "default" : "destructive"}
                className="flex items-center gap-2 p-2 rounded-md"
              >
                {order.type.toUpperCase()} {order.quantity} @ ${order.price?.toFixed(2)}
                <button onClick={() => cancelOrder(order._id)} className="ml-2 text-gray-300 hover:text-white">✕</button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}