"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ShoppingCart, TrendingDown, Clock } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useOrders } from "@/contexts/order-context";

interface EnhancedTradingInterfaceProps {
  symbol: string;
  name: string;
  currentPrice: number;
}

type OrderType = "market" | "limit" | "stop";

export function EnhancedTradingInterface({
  symbol,
  name,
  currentPrice,
}: EnhancedTradingInterfaceProps) {
  const { user } = useAuth();
  const {
    orders,
    placeOrder,
    cancelOrder,
    isLoading,
    getOpenOrders,
    fetchOrders,
  } = useOrders();

  const [orderType, setOrderType] = useState<OrderType>("market");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(currentPrice.toString());

  const pendingOrders = getOpenOrders().filter((o) => o.symbol === symbol);

  const handleTrade = async (side: "buy" | "sell") => {
    const qty = Number.parseFloat(quantity);
    if (qty <= 0) return;

    const orderPrice =
      orderType !== "market" ? Number.parseFloat(price) : currentPrice;

    const success = await placeOrder({
      symbol,
      quantity: qty,
      price: orderPrice,
      type: side,
      orderType,
    });

    if (success) {
      setQuantity("");
      setPrice(currentPrice.toString());
      fetchOrders();
    }
  };

  const calculateTotal = () => {
    const qty = Number.parseFloat(quantity) || 0;
    const orderPrice =
      orderType === "market" ? currentPrice : Number.parseFloat(price) || 0;
    const subtotal = qty * orderPrice;
    const fees = subtotal * 0.001;
    return (subtotal + fees).toFixed(2);
  };

  const calculateMaxQuantity = () => {
    const orderPrice =
      orderType === "market"
        ? currentPrice
        : Number.parseFloat(price) || currentPrice;
    return Math.floor(100000 / (orderPrice * 1.001)); // replace 100000 with actual available cash if needed
  };

  if (!user) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Sign In Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">Please sign in to start trading</p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 glow-border">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-4 border-b border-gray-700">
          <CardTitle className="text-white text-2xl font-extrabold flex items-center gap-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
            <ShoppingCart className="h-5 w-5 text-white drop-shadow-md" />
            Trade {symbol}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-600 rounded-xl shadow-sm overflow-hidden">
              <TabsTrigger
                value="buy"
                className="text-white py-2 font-semibold transition-all duration-200 hover:bg-green-700 hover:text-white data-[state=active]:bg-green-600 data-[state=active]:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Buy
              </TabsTrigger>
              <TabsTrigger
                value="sell"
                className="text-white py-2 font-semibold transition-all duration-200 hover:bg-red-700 hover:text-white data-[state=active]:bg-red-600 data-[state=active]:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Sell
              </TabsTrigger>
            </TabsList>

            {/* BUY TAB */}
            <TabsContent value="buy" className="space-y-6 mt-6">
              <div className="space-y-5">
                {/* Order Type Selector */}
                <Select
                  value={orderType}
                  onValueChange={(v) => setOrderType(v as OrderType)}
                >
                  <SelectTrigger className="bg-gray-800 border border-gray-600 text-white rounded-xl shadow-sm hover:border-gray-500 transition">
                    <SelectValue placeholder="Select Order Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border border-gray-600 text-white rounded-xl">
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="stop">Stop Order</SelectItem>
                  </SelectContent>
                </Select>

                {/* Quantity Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-300">Quantity</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setQuantity(calculateMaxQuantity().toString())
                      }
                      className="text-xs text-blue-400 hover:text-blue-300 h-auto p-0"
                    >
                      Max: {calculateMaxQuantity()}
                    </Button>
                  </div>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-gray-800 border border-gray-600 text-white rounded-xl shadow-sm focus:border-blue-500 transition"
                  />
                </div>

                {/* Conditional Price Input */}
                {orderType !== "market" && (
                  <div className="space-y-1.5">
                    <Label className="text-gray-300">
                      {orderType === "limit" ? "Limit Price" : "Trigger Price"}
                    </Label>
                    <Input
                      type="number"
                      placeholder={currentPrice.toString()}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="bg-gray-800 border border-gray-600 text-white rounded-xl shadow-sm focus:border-blue-500 transition"
                    />
                  </div>
                )}

                {/* Total Summary */}
                <div className="p-4 bg-gray-800 rounded-xl border border-gray-600 shadow-inner">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300 font-medium">Total:</span>
                    <span className="text-white font-semibold">
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>

                {/* Buy Button */}
                <Button
                  onClick={() => handleTrade("buy")}
                  disabled={isLoading || !quantity}
                  className="w-full bg-green-600 hover:bg-green-500 hover:scale-[1.01] active:scale-[0.99] transition transform rounded-xl text-white font-semibold py-2 shadow-md"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isLoading ? "Processing..." : `Buy ${symbol}`}
                </Button>
              </div>
            </TabsContent>

            {/* SELL TAB */}
            <TabsContent value="sell" className="space-y-6 mt-6">
              <div className="space-y-5">
                {/* Order Type Dropdown */}
                <Select
                  value={orderType}
                  onValueChange={(v) => setOrderType(v as OrderType)}
                >
                  <SelectTrigger className="bg-gray-800 border border-gray-600 text-white rounded-xl shadow-sm hover:border-gray-500 transition">
                    <SelectValue placeholder="Select Order Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border border-gray-600 text-white rounded-xl">
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="stop">Stop Order</SelectItem>
                  </SelectContent>
                </Select>

                {/* Quantity Input */}
                <div className="space-y-1.5">
                  <Label className="text-gray-300">Quantity</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-gray-800 border border-gray-600 text-white rounded-xl shadow-sm focus:border-red-500 transition"
                  />
                </div>

                {/* Conditional Price Input */}
                {orderType !== "market" && (
                  <div className="space-y-1.5">
                    <Label className="text-gray-300">
                      {orderType === "limit" ? "Limit Price" : "Trigger Price"}
                    </Label>
                    <Input
                      type="number"
                      placeholder={currentPrice.toString()}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="bg-gray-800 border border-gray-600 text-white rounded-xl shadow-sm focus:border-red-500 transition"
                    />
                  </div>
                )}

                {/* Total Summary */}
                <div className="p-4 bg-gray-800 rounded-xl border border-gray-600 shadow-inner">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300 font-medium">Total:</span>
                    <span className="text-white font-semibold">
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>

                {/* Sell Button */}
                <Button
                  onClick={() => handleTrade("sell")}
                  disabled={isLoading || !quantity}
                  className="w-full bg-red-600 hover:bg-red-500 hover:scale-[1.01] active:scale-[0.98] transition transform rounded-xl text-white font-semibold py-2 shadow-md"
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  {isLoading ? "Processing..." : `Sell ${symbol}`}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {pendingOrders.length > 0 && (
        <Card className="bg-gray-900 border border-gray-700 shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center">
              <Clock className="h-4 w-4 mr-2 text-yellow-400" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
              >
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={order.type === "buy" ? "default" : "destructive"}
                  >
                    {order.type.toUpperCase()}
                  </Badge>
                  <span className="text-white text-sm">
                    {order.quantity} @ ${order.price?.toFixed(2) || "Market"}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => cancelOrder(order._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Cancel
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
