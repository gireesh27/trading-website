
export interface Order {
  _id: string;
  userId: string; // string representation of mongoose.ObjectId
  symbol: string;
  sector: "Markets" | "crypto" ;
  quantity: number;
  price?: number;
  type: "buy" | "sell";
  status: "completed" | "pending" | "cancelled";
  orderType: "market" | "limit" | "stop";
  feeBreakdown?: {
    brokerage: number;
    convenience: number;
  };
  holdingPeriod?: number; // number of milliseconds or days, as per backend
  profitOrLoss?: number;

  // Additional frontend fields:
  stopPrice?: number;
  targetPrice?: number;
  filledQuantity: number;
  averagePrice?: number;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
  validTill?: string; // ISO string date
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