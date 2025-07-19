"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, TrendingDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TradingInterfaceProps {
  symbol: string
  currentPrice: number
}

export function TradingInterface({ symbol, currentPrice }: TradingInterfaceProps) {
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState(currentPrice.toString())
  const [stopPrice, setStopPrice] = useState("")
  const { toast } = useToast()

  const handleBuy = () => {
    toast({
      title: "Buy Order Placed",
      description: `Buy ${quantity} ${symbol} at ${orderType === "market" ? "market price" : `$${price}`}`,
    })
  }

  const handleSell = () => {
    toast({
      title: "Sell Order Placed",
      description: `Sell ${quantity} ${symbol} at ${orderType === "market" ? "market price" : `$${price}`}`,
    })
  }

  const calculateTotal = () => {
    const qty = Number.parseFloat(quantity) || 0
    const orderPrice = orderType === "market" ? currentPrice : Number.parseFloat(price) || 0
    return (qty * orderPrice).toFixed(2)
  }

  return (
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

          <TabsContent value="buy" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Order Type</Label>
                <Select value={orderType} onValueChange={(value: "market" | "limit" | "stop") => setOrderType(value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="stop">Stop Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Quantity</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {orderType !== "market" && (
                <div>
                  <Label className="text-gray-300">Price</Label>
                  <Input
                    type="number"
                    placeholder={currentPrice.toString()}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              )}

              {orderType === "stop" && (
                <div>
                  <Label className="text-gray-300">Stop Price</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              )}

              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total:</span>
                  <span className="text-white font-bold">${calculateTotal()}</span>
                </div>
              </div>

              <Button onClick={handleBuy} className="w-full bg-green-600 hover:bg-green-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy {symbol}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Order Type</Label>
                <Select value={orderType} onValueChange={(value: "market" | "limit" | "stop") => setOrderType(value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="stop">Stop Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Quantity</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {orderType !== "market" && (
                <div>
                  <Label className="text-gray-300">Price</Label>
                  <Input
                    type="number"
                    placeholder={currentPrice.toString()}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              )}

              {orderType === "stop" && (
                <div>
                  <Label className="text-gray-300">Stop Price</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              )}

              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total:</span>
                  <span className="text-white font-bold">${calculateTotal()}</span>
                </div>
              </div>

              <Button onClick={handleSell} className="w-full bg-red-600 hover:bg-red-700">
                <TrendingDown className="h-4 w-4 mr-2" />
                Sell {symbol}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
