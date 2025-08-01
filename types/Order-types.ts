
export interface Order {
  _id: string;
  symbol: string;
  type: "buy" | "sell";
  orderType: "market" | "limit" | "stop";
  quantity: number;
  price?: number;
  stopPrice?: number;
  targetPrice?: number;
  status: "pending" | "cancelled" | "completed";
  filledQuantity: number;
  averagePrice?: number;
  createdAt: string;
  updatedAt: string;
  validTill?: string;
  userId: string;
}

export interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  placeOrder: (orderData: Partial<Order>) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  getOrderHistory: () => Order[];
  getOpenOrders: () => Order[];
  fetchOrders: () => Promise<void>;
  getOrder: (orderId: string) => Promise<Order | null>;

}