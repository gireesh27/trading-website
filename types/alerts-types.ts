export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'price' | 'percent_change' | 'volume';
  condition: 'above' | 'below';
  value: number;
  status: 'active' | 'triggered' | 'inactive';
  createdAt: string;
  triggeredAt?: string;
}

export interface NewsAlert {
    id: string;
    symbol: string;
    type: 'news';
    keywords: string[]; // e.g., ['earnings', 'FDA']
    status: 'active' | 'inactive';
    createdAt: string;
}

// A union type for all possible alert types
export type Alert = PriceAlert | NewsAlert;

export interface AlertContextType {
  alerts: Alert[];
  isLoading: boolean;
  addAlert: (alertData: Omit<Alert, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateAlert: (alert: Alert) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
}