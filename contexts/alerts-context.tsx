"use client"
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { Alert, AlertContextType } from '@/types/alerts-types'

const AlertsContext = createContext<AlertContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/alerts');
      if (!response.ok) throw new Error('Failed to fetch alerts.');
      const data = await response.json();
      setAlerts(data.data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const addAlert = async (alertData: Omit<Alert, 'id' | 'createdAt' | 'status'>) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });
      if (!response.ok) throw new Error('Failed to create alert.');
      const result = await response.json();
      setAlerts(prev => [...prev, result.data]);
      toast({ title: "Success", description: "Your new alert has been created." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateAlert = async (alert: Alert) => {
    try {
      const response = await fetch(`/api/alerts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
      if (!response.ok) throw new Error('Failed to update alert.');
      const result = await response.json();
      setAlerts(prev => prev.map(a => a.id === alert.id ? result.data : a));
      toast({ title: "Success", description: "Alert has been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId }),
      });
      if (!response.ok) throw new Error('Failed to delete alert.');
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      toast({ title: "Success", description: "Alert has been deleted." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AlertsContext.Provider value={{ alerts, isLoading, addAlert, updateAlert, deleteAlert }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
}