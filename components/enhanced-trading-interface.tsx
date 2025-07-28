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

    const orderPrice = orderType !== "market" ? Number.parseFloat(price) : currentPrice;

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
    const orderPrice = orderType === "market" ? currentPrice : Number.parseFloat(price) || 0;
    const subtotal = qty * orderPrice;
    const fees = subtotal * 0.001;
    return (subtotal + fees).toFixed(2);
  };

  const calculateMaxQuantity = () => {
    const orderPrice = orderType === "market" ? currentPrice : Number.parseFloat(price) || currentPrice;
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
    <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Trade {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="buy" className="data-[state=active]:bg-green-600">
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-red-600">
                Sell
              </TabsTrigger>
            </TabsList>

            {/* BUY TAB */}
            <TabsContent value="buy" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="stop">Stop Order</SelectItem>
                  </SelectContent>
                </Select>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-gray-300">Quantity</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(calculateMaxQuantity().toString())}
                      className="text-xs text-blue-400 h-auto p-0"
                    >
                      Max: {calculateMaxQuantity()}
                    </Button>
                  </div>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                {orderType !== "market" && (
                  <div>
                    <Label className="text-gray-300">
                      {orderType === "limit" ? "Limit Price" : "Trigger Price"}
                    </Label>
                    <Input
                      type="number"
                      placeholder={currentPrice.toString()}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                )}

                <div className="p-3 bg-gray-700 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">Total:</span>
                    <span className="text-white font-bold">${calculateTotal()}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleTrade("buy")}
                  disabled={isLoading || !quantity}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isLoading ? "Processing..." : `Buy ${symbol}`}
                </Button>
              </div>
            </TabsContent>

            {/* SELL TAB */}
            <TabsContent value="sell" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="stop">Stop Order</SelectItem>
                  </SelectContent>
                </Select>

                <div>
                  <Label className="text-gray-300">Quantity</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                {orderType !== "market" && (
                  <div>
                    <Label className="text-gray-300">
                      {orderType === "limit" ? "Limit Price" : "Trigger Price"}
                    </Label>
                    <Input
                      type="number"
                      placeholder={currentPrice.toString()}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                )}

                <Button
                  onClick={() => handleTrade("sell")}
                  disabled={isLoading || !quantity}
                  className="w-full bg-red-600 hover:bg-red-700"
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
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingOrders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-2 bg-gray-700 rounded"
              >
                <div className="flex items-center space-x-2">
                  <Badge variant={order.type === "buy" ? "default" : "destructive"}>
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
