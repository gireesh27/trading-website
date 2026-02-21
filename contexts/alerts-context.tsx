"use client"
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "react-toastify";
import type { Alert, AlertContextType } from "@/types/alerts-types";
import { useSession } from "next-auth/react";

const AlertsContext = createContext<AlertContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { data: session } = useSession();

  const userId = session?.user?.id;

  const showError = (message: string) =>
    toast.error(message);

  // Normalize alert so it always has id
  const normalizeAlert = (alert: any): Alert => ({
    ...alert,
    id: alert.id || alert._id,
  });

  //  Fetch alerts for the current user
  const fetchAlerts = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/alerts?userId=${userId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Failed to fetch alerts");

      const normalized = json.data.map(normalizeAlert);
      setAlerts(normalized);
    } catch (err: any) {
      showError(err.message || "Could not load alerts");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  //  Fetch alerts when user session is ready
  useEffect(() => {
    if (userId) {
      fetchAlerts();
    }
  }, [userId, fetchAlerts]);

  //  Add new alert
  const addAlert: AlertContextType["addAlert"] = async (alertData) => {
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...alertData, userId }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Failed to create alert");

      setAlerts((prev) => [...prev, normalizeAlert(json.data)]);
      toast.success("Alert Created Successfully")
    } catch (err: any) {
      showError(err.message || "Unknown error");
    }
  };

  //  Update alert
  const updateAlert: AlertContextType["updateAlert"] = async (alert) => {
    try {
      const res = await fetch(`/api/alerts/${alert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Failed to update alert");

      const updated = normalizeAlert(json.alert || json.data);
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? updated : a)));
      toast.success("Alert Updated Successfully");
    } catch (err: any) {
      showError(err.message || "Update failed");
    }
  };

  //  Delete alert
  const deleteAlert: AlertContextType["deleteAlert"] = async (alertId) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Failed to delete alert");

      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast.success("Alert Deleted Successfully");
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
