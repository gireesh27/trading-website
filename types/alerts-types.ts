// types/alerts-types.ts

export interface PriceAlert {
  id: string;
  symbol: string; // ✅ Make sure this exists
  type: 'price' | 'percent_change' | 'volume';
  condition: 'above' | 'below';
  value: number;
  status: 'active' | 'triggered' | 'inactive';
  createdAt: string;
  triggeredAt?: string;
}

export interface NewsAlert {
  id: string;
  symbol: string; // ✅ Also in NewsAlert
  type: 'news';
  keywords: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

// A union type for all alert types
export type Alert = PriceAlert | NewsAlert;

// Context type
export interface AlertContextType {
  alerts: Alert[];
  isLoading: boolean;
  addAlert: (
    alertData: Omit<Alert, 'id' | 'createdAt' | 'status' | 'triggeredAt'>
  ) => Promise<void>;
  updateAlert: (alert: Alert) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
}
