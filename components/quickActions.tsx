"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Search,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function QuickActions() {
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [quickTrade, setQuickTrade] = useState({
    symbol: '',
    quantity: '',
    orderType: 'market'
  })

  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.80 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.25 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90 }
  ]

  const executeQuickTrade = () => {
    if (!quickTrade.symbol || !quickTrade.quantity) return
    
    console.log('Executing trade:', { ...quickTrade, type: tradeType })
    // Here you would integrate with your trading API
    
    setQuickTrade({ symbol: '', quantity: '', orderType: 'market' })
    setIsTradeDialogOpen(false)
  }

  const openTradeDialog = (type: 'buy' | 'sell', symbol?: string) => {
    setTradeType(type)
    if (symbol) {
      setQuickTrade(prev => ({ ...prev, symbol }))
    }
    setIsTradeDialogOpen(true)
  }

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
                onClick={() => openTradeDialog('buy')}
                className="bg-green-600 hover:bg-green-700 text-white h-12"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Quick Buy
              </Button>
            </DialogTrigger>
            
            <DialogTrigger asChild>
              <Button 
                onClick={() => openTradeDialog('sell')}
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
                  {tradeType === 'buy' ? (
                    <ArrowUpRight className="h-5 w-5 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-400" />
                  )}
                  <span>Quick {tradeType.charAt(0).toUpperCase() + tradeType.slice(1)}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="symbol" className="text-gray-300">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="e.g., AAPL"
                    value={quickTrade.symbol}
                    onChange={(e) => setQuickTrade(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity" className="text-gray-300">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Number of shares"
                    value={quickTrade.quantity}
                    onChange={(e) => setQuickTrade(prev => ({ ...prev, quantity: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="orderType" className="text-gray-300">Order Type</Label>
                  <Select 
                    value={quickTrade.orderType} 
                    onValueChange={(value) => setQuickTrade(prev => ({ ...prev, orderType: value }))}
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
                    className={`flex-1 ${
                      tradeType === 'buy' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {tradeType === 'buy' ? 'Buy' : 'Sell'} {quickTrade.symbol}
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
                      onClick={() => openTradeDialog('buy', stock.symbol)}
                      className="bg-green-600 hover:bg-green-700 h-6 px-2 text-xs"
                    >
                      Buy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openTradeDialog('sell', stock.symbol)}
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

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Quick Links</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-start"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Markets
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-start"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Screener
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
