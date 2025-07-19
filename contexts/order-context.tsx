"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: string
  symbol: string
  type: "buy" | "sell"
  orderType: "market" | "limit" | "stop_loss" | "bracket"
  quantity: number
  price?: number
  stopPrice?: number
  targetPrice?: number
  status: "pending" | "partial" | "filled" | "cancelled" | "rejected"
  filledQuantity: number
  averagePrice?: number
  createdAt: string
  updatedAt: string
  validTill?: string
  userId: string
}

interface OrderContextType {
  orders: Order[]
  isLoading: boolean
  placeOrder: (orderData: Partial<Order>) => Promise<boolean>
  modifyOrder: (orderId: string, updates: Partial<Order>) => Promise<boolean>
  cancelOrder: (orderId: string) => Promise<boolean>
  getOrderHistory: () => Order[]
  getOpenOrders: () => Order[]
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadOrderHistory()

    // Simulate real-time order updates
    const interval = setInterval(() => {
      updateOrderStatuses()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const loadOrderHistory = async () => {
    try {
      // Simulate loading order history
      const mockOrders: Order[] = [
        {
          id: "ord_001",
          symbol: "RELIANCE",
          type: "buy",
          orderType: "limit",
          quantity: 10,
          price: 2450.0,
          status: "filled",
          filledQuantity: 10,
          averagePrice: 2448.75,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86000000).toISOString(),
          userId: "user_123",
        },
        {
          id: "ord_002",
          symbol: "TCS",
          type: "sell",
          orderType: "market",
          quantity: 5,
          status: "filled",
          filledQuantity: 5,
          averagePrice: 3565.2,
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          updatedAt: new Date(Date.now() - 43000000).toISOString(),
          userId: "user_123",
        },
        {
          id: "ord_003",
          symbol: "HDFCBANK",
          type: "buy",
          orderType: "limit",
          quantity: 20,
          price: 1675.0,
          status: "pending",
          filledQuantity: 0,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          validTill: new Date(Date.now() + 86400000).toISOString(),
          userId: "user_123",
        },
      ]

      setOrders(mockOrders)
    } catch (error) {
      console.error("Failed to load order history:", error)
    }
  }

  const placeOrder = async (orderData: Partial<Order>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newOrder: Order = {
        id: `ord_${Date.now()}`,
        symbol: orderData.symbol!,
        type: orderData.type!,
        orderType: orderData.orderType!,
        quantity: orderData.quantity!,
        price: orderData.price,
        stopPrice: orderData.stopPrice,
        targetPrice: orderData.targetPrice,
        status: orderData.orderType === "market" ? "filled" : "pending",
        filledQuantity: orderData.orderType === "market" ? orderData.quantity! : 0,
        averagePrice: orderData.orderType === "market" ? orderData.price : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        validTill: orderData.orderType !== "market" ? new Date(Date.now() + 86400000).toISOString() : undefined,
        userId: "user_123",
      }

      setOrders((prev) => [newOrder, ...prev])

      toast({
        title: "Order Placed",
        description: `${orderData.type?.toUpperCase()} order for ${orderData.quantity} ${orderData.symbol} placed successfully`,
      })

      return true
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const modifyOrder = async (orderId: string, updates: Partial<Order>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, ...updates, updatedAt: new Date().toISOString() } : order,
        ),
      )

      toast({
        title: "Order Modified",
        description: "Order has been modified successfully",
      })

      return true
    } catch (error) {
      toast({
        title: "Modification Failed",
        description: "Failed to modify order. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: "cancelled" as const, updatedAt: new Date().toISOString() }
            : order,
        ),
      )

      toast({
        title: "Order Cancelled",
        description: "Order has been cancelled successfully",
      })

      return true
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatuses = () => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.status === "pending" && Math.random() < 0.1) {
          // Simulate order fills
          const fillType = Math.random()
          if (fillType < 0.7) {
            // Full fill
            return {
              ...order,
              status: "filled" as const,
              filledQuantity: order.quantity,
              averagePrice: order.price || 0,
              updatedAt: new Date().toISOString(),
            }
          } else if (fillType < 0.9) {
            // Partial fill
            const partialQuantity = Math.floor(order.quantity * Math.random() * 0.8) + 1
            return {
              ...order,
              status: "partial" as const,
              filledQuantity: partialQuantity,
              averagePrice: order.price || 0,
              updatedAt: new Date().toISOString(),
            }
          }
        }
        return order
      }),
    )
  }

  const getOrderHistory = () => {
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const getOpenOrders = () => {
    return orders.filter((order) => ["pending", "partial"].includes(order.status))
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        placeOrder,
        modifyOrder,
        cancelOrder,
        getOrderHistory,
        getOpenOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}
