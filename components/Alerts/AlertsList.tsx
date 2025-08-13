"use client";

import { useEffect, useState } from "react";
import { useAlerts } from "@/contexts/alerts-context";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Loader2 } from "lucide-react";
import type { Alert } from "@/types/alerts-types";

interface AlertsListProps {
  onEdit: (alert: Alert) => void;
}

export function AlertsList({ onEdit }: AlertsListProps) {
  const { alerts, fetchAlerts, deleteAlert, isLoading } = useAlerts();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Fetch alerts when component mounts (context handles userId)
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const isEmpty = !alerts || alerts.length === 0;

  return (
    <div className="space-y-4">
      {isLoading ? (
        <p className="text-gray-400 text-sm text-center animate-pulse">
          Loading alerts...
        </p>
      ) : isEmpty ? (
        <p className="text-gray-400 text-sm text-center">
          No alerts found. Click{" "}
          <span className="text-blue-400 font-semibold">"Create Alert"</span> to
          add one.
        </p>
      ) : (
        alerts.map((alert) => (
          <div
            key={alert.id}
            className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:scale-[1.02] hover:border-white/20 hover:shadow-lg"
          >
            {/* Decorative Glow on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 transition-opacity" />

            <div className="flex justify-between items-center px-5 py-4 relative z-10">
              {/* Left side: Alert info */}
              <div className="space-y-1">
                <p className="font-semibold text-lg text-white tracking-wide">
                  {alert.symbol.toUpperCase()}{" "}
                  <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-md">
                    {alert.type.replace("_", " ").toUpperCase()}
                  </span>
                </p>

                {alert.type === "price" && alert.direction !== undefined && (
                  <p className="text-sm text-gray-300">
                    {alert.direction.toUpperCase()}{" "}
                    <span className="text-blue-400 font-medium">
                      {alert.targetPrice}
                    </span>
                  </p>
                )}
              </div>

              {/* Right side: Actions */}
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(alert)}
                  className="rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md transition-colors"
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
          </div>
        ))
      )}
    </div>
  );
}
