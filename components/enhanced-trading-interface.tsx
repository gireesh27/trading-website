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
import { useTrading } from "@/contexts/trading-context";
import { useAuth } from "@/contexts/auth-context";
import { TradingContextType } from "@/types/trading-types";
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
    portfolio,
    orders,
    cancelOrder,
    placeOrder,
    isLoading,
    getPositionBySymbol,
    refreshOrders,
  } = useTrading();

  const [orderType, setOrderType] = useState<OrderType>("market");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(currentPrice.toString());

  const position = getPositionBySymbol(symbol);
  // const pendingOrders = orders.filter(
  //   (order) => order.symbol === symbol && order.status === "pending"
  // );

const handleTrade = async (side: "buy" | "sell") => {
    const qty = Number.parseFloat(quantity);
    if (qty <= 0) return;

    const limitPrice = orderType !== "market" ? Number.parseFloat(price) : currentPrice;

    const res = await fetch("/api/trading/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol,
        quantity: qty,
        price: limitPrice,
        type: side,
        orderType,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setQuantity("");
      setPrice(currentPrice.toString());
      refreshOrders();
    } else {
      alert(data.error || "Trade failed");
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

  const calculateMaxQuantity = (side: "buy" | "sell") => {
    if (side === "sell") return position?.quantity || 0;
    const limitPrice = orderType === "market" ? currentPrice : Number.parseFloat(price) || currentPrice;
    return Math.floor(portfolio.availableCash / (limitPrice * 1.001));
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
      {position && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Your Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Shares:</span>
              <span className="text-white">{position.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Price:</span>
              <span className="text-white">
                ${position.avgPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Current Value:</span>
              <span className="text-white">
                ${position.totalValue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">P&L:</span>
              <span
                className={
                  position.gainLoss >= 0 ? "text-green-400" : "text-red-400"
                }
              >
                ${position.gainLoss.toFixed(2)} (
                {position.gainLossPercent.toFixed(2)}%)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Available Cash:</span>
            <span className="text-white font-bold">
              ${portfolio.availableCash.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>


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
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="stop">Stop Order</SelectItem>
                  </SelectContent>
                </Select>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-gray-300">Quantity</Label>
                    <Button variant="ghost" size="sm" onClick={() => setQuantity(calculateMaxQuantity("buy").toString())} className="text-xs text-blue-400 h-auto p-0">
                      Max: {calculateMaxQuantity("buy")}
                    </Button>
                  </div>
                  <Input type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-gray-700 border-gray-600 text-white" />
                </div>
                {orderType !== "market" && (
                  <div>
                    <Label className="text-gray-300">{orderType === "limit" ? "Limit Price" : "Trigger Price"}</Label>
                    <Input type="number" placeholder={currentPrice.toString()} value={price} onChange={(e) => setPrice(e.target.value)} className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                )}
                <div className="p-3 bg-gray-700 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">Total:</span>
                    <span className="text-white font-bold">${calculateTotal()}</span>
                  </div>
                </div>
                <Button onClick={() => handleTrade("buy")} disabled={isLoading || !quantity || Number.parseFloat(calculateTotal()) > portfolio.availableCash} className="w-full bg-green-600 hover:bg-green-700">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isLoading ? "Processing..." : `Buy ${symbol}`}
                </Button>
              </div>
            </TabsContent>

            {/* SELL TAB */}
            <TabsContent value="sell" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="stop">Stop Order</SelectItem>
                  </SelectContent>
                </Select>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-gray-300">Quantity</Label>
                    {position && (
                      <Button variant="ghost" size="sm" onClick={() => setQuantity(calculateMaxQuantity("sell").toString())} className="text-xs text-blue-400 h-auto p-0">
                        Max: {calculateMaxQuantity("sell")}
                      </Button>
                    )}
                  </div>
                  <Input type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-gray-700 border-gray-600 text-white" />
                </div>
                {orderType !== "market" && (
                  <div>
                    <Label className="text-gray-300">{orderType === "limit" ? "Limit Price" : "Trigger Price"}</Label>
                    <Input type="number" placeholder={currentPrice.toString()} value={price} onChange={(e) => setPrice(e.target.value)} className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                )}
                <Button onClick={() => handleTrade("sell")} disabled={isLoading || !quantity || !position || Number.parseFloat(quantity) > (position?.quantity || 0)} className="w-full bg-red-600 hover:bg-red-700">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  {isLoading ? "Processing..." : `Sell ${symbol}`}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* {pendingOrders.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                <div className="flex items-center space-x-2">
                  <Badge variant={order.type === "buy" ? "default" : "destructive"}>{order.type.toUpperCase()}</Badge>
                  <span className="text-white text-sm">{order.quantity} @ ${order.price?.toFixed(2) || "Market"}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => cancelOrder(order.id)} className="text-red-400 hover:text-red-300">
                  Cancel
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )} */}
    </div>
  );
}