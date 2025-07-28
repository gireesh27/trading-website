export interface Order {
  _id: string;
  userId: string;
  symbol: string;
  type: "buy" | "sell"; // market direction
  orderType: "market" | "limit" | "stop"; // order strategy
  quantity: number;
  price?: number;       
  stopPrice?: number;    
  targetPrice?: number;   
  status: "pending" | "partial" | "filled" | "cancelled";
  filledQuantity: number;
  averagePrice?: number;
  createdAt: string; 
  updatedAt: string; 
}