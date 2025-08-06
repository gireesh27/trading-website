"use client";

import { useEffect, useState } from "react";
import { useAlerts } from "@/contexts/alerts-context";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Loader2 } from "lucide-react";
import type { Alert } from "@/types/alerts-types";

interface AlertsListProps {
  onEdit: (alert: Alert) => void;
  userId: string | undefined;
}

export function AlertsList({ onEdit, userId }: AlertsListProps) {
  const { alerts, fetchAlerts, deleteAlert, isLoading } = useAlerts();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchAlerts(userId);
    }
  }, [fetchAlerts, userId]);

  const isEmpty = !alerts || alerts.length === 0;

  return (
    <div className="space-y-3">
      {isLoading ? (
        <p className="text-gray-400 text-sm text-center">Loading alerts...</p>
      ) : isEmpty ? (
        <p className="text-gray-400 text-sm text-center">
          No alerts found. Click "Create Alert" to add one.
        </p>
      ) : (
        alerts.map((alert, index) => (
          <div
            key={alert.id || `${alert.type}-${index}`}
            className="flex justify-between items-center bg-gray-700 px-4 py-3 rounded-md"
          >
            <div className="text-white space-y-1">
              <p className="font-semibold">
                {alert.symbol.toUpperCase()} — {alert.type.toUpperCase()}
              </p>
              {"targetPrice" in alert && (
                <p className="text-sm text-gray-300">
                  {alert.direction.toUpperCase()} {alert.targetPrice}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(alert)}
                className="text-blue-400 hover:text-blue-600"
              >
                <Pencil className="w-4 h-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="text-red-400 hover:text-red-600"
                onClick={async () => {
                  setLoadingId(alert.id);
                  await deleteAlert(alert.id);
                  setLoadingId(null);
                }}
              >
                {loadingId === alert.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
