"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Alert, AlertContextType } from "@/types/alerts-types";
import { useSession } from "next-auth/react";

const AlertsContext = createContext<AlertContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { data: session } = useSession();

  const userId = session?.user?.id;

  const showError = (message: string) =>
    toast({ title: "Error", description: message, variant: "destructive" });

  // ✅ Fetch alerts for the current user
  const fetchAlerts = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/alerts?userId=${userId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch alerts");

      setAlerts(json.data);
    } catch (err: any) {
      showError(err.message || "Could not load alerts");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // ✅ Fetch alerts when user session is ready
  useEffect(() => {
    if (userId) {
      fetchAlerts();
    }
  }, [userId, fetchAlerts]);

  // ✅ Add new alert
  const addAlert: AlertContextType["addAlert"] = async (alertData) => {
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...alertData, userId }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to create alert");

      setAlerts((prev) => [...prev, json.data]);
      toast({ title: "✅ Alert Created", description: `${json.data.symbol}` });
    } catch (err: any) {
      showError(err.message || "Unknown error");
    }
  };

  // ✅ Update alert
  const updateAlert: AlertContextType["updateAlert"] = async (alert) => {
    try {
      const res = await fetch(`/api/alerts/${alert._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update alert");

      setAlerts((prev) =>
        prev.map((a) => (a._id === alert._id ? json.data : a))
      );
      toast({ title: "✅ Alert Updated", description: `${alert.symbol}` });
    } catch (err: any) {
      showError(err.message || "Update failed");
    }
  };

  // ✅ Delete alert
  const deleteAlert: AlertContextType["deleteAlert"] = async (alertId) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to delete alert");

      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
      toast({ title: "🗑️ Alert Deleted" });
    } catch (err: any) {
      showError(err.message || "Delete failed");
    }
  };

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        isLoading,
        fetchAlerts,
        addAlert,
        updateAlert,
        deleteAlert,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error("useAlerts must be used within an AlertsProvider");
  }
  return context;
}
