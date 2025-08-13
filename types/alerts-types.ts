// types/alerts-types.ts

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  sector?: string;
  type: 'price' | 'percent_change' | 'volume';
  direction: 'above' | 'below';
  targetPrice: number;
  status: 'active' | 'triggered' | 'inactive';
  createdAt: string;
  triggeredAt?: string;
}

export interface NewsAlert {
  id: string;
  userId: string;
  symbol: string;
  sector?: string;
  type: 'news';
  keywords?: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export type Alert = PriceAlert | NewsAlert;

export interface AlertContextType {
  alerts: Alert[];
  isLoading: boolean;
  addAlert: (
    alertData: Partial<Omit<Alert, "id" | "createdAt" | "status" | "triggeredAt">> & { userId: string }
  ) => Promise<void>;
  updateAlert: (alert: Alert) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  fetchAlerts: () => Promise<void>;
}
