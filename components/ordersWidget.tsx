"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTrading } from '@/contexts/trading-context' // Import the trading context
import type { Order } from '@/contexts/trading-context' // Import the Order type

export function OrdersWidget() {
  const { orders, cancelOrder, isLoading, fetchOrders } = useTrading(); // Use the trading context
  const [activeTab, setActiveTab] = useState('open')

  const openOrders = orders.filter(order =>
    order.status === 'pending' || order.status === 'partial'
  )
  const closedOrders = orders.filter(order =>
    order.status === 'filled' || order.status === 'cancelled'
  )

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600'
      case 'filled': return 'bg-green-600'
      case 'cancelled': return 'bg-red-600'
      case 'partial': return 'bg-blue-600'
      default: return 'bg-gray-600'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />
      case 'filled': return <CheckCircle className="h-3 w-3" />
      case 'cancelled': return <XCircle className="h-3 w-3" />
      case 'partial': return <Clock className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }
  
  const formatDate = (date: string | Date) => {
      const d = new Date(date);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return 'Just now';
  };

  const handleCancelOrder = async (orderId: string) => {
    await cancelOrder(orderId);
  }

  const OrderItem = ({ order }: { order: Order }) => (
    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`p-1 rounded ${order.type === 'buy' ? 'bg-green-600' : 'bg-red-600'}`}>
          {order.type === 'buy' ? (
            <TrendingUp className="h-3 w-3 text-white" />
          ) : (
            <TrendingDown className="h-3 w-3 text-white" />
          )}
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold text-sm">{order.symbol}</span>
            <Badge className={`${getStatusColor(order.status)} text-xs`}>
              {getStatusIcon(order.status)}
              <span className="ml-1">{order.status}</span>
            </Badge>
          </div>
          
          <div className="text-xs text-gray-400">
            {order.orderType.toUpperCase()} • {order.quantity} shares
            {order.price && ` @ $${order.price.toFixed(2)}`}
          </div>
          
          <div className="text-xs text-gray-500">
            {formatDate(order.createdAt)}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {order.status === 'filled' && order.price && (
          <div className="text-right">
            <div className="text-white text-sm font-medium">
              ${order.price.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">
              {order.quantity} filled
            </div>
          </div>
        )}
        
        {order.status === 'partial' && (
          <div className="text-right">
             <div className="text-blue-400 text-sm font-medium">
              {order.filledQuantity}/{order.quantity}
            </div>
            <div className="text-xs text-gray-400">
              ${order.price?.toFixed(2)}
            </div>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white" align="end">
            {(order.status === 'pending' || order.status === 'partial') && (
              <DropdownMenuItem 
                onClick={() => handleCancelOrder(order.id)}
                className="text-red-400 focus:text-red-300 focus:bg-red-900/50"
              >
                Cancel Order
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="focus:bg-gray-700">
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Orders</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchOrders}
            disabled={isLoading}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-700 mx-4 mb-4">
            <TabsTrigger value="open" className="data-[state=active]:bg-gray-600 text-white">
              Open ({openOrders.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gray-600 text-white">
              History ({closedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="px-4 pb-4">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {isLoading && openOrders.length === 0 ? (
                 <div className="text-center py-8 text-gray-400">Loading open orders...</div>
              ) : openOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">No open orders</p>
                </div>
              ) : (
                openOrders.map(order => (
                  <OrderItem key={order.id} order={order} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="px-4 pb-4">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {isLoading && closedOrders.length === 0 ? (
                 <div className="text-center py-8 text-gray-400">Loading order history...</div>
              ) : closedOrders.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">No order history</p>
                </div>
              ) : (
                closedOrders.map(order => (
                  <OrderItem key={order.id} order={order} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}