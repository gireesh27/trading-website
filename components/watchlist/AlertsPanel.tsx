"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  BellOff,
  Trash2,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";
import { useWatchlist } from "@/contexts/watchlist-context";
import { PriceAlert } from "@/types/watchlistypes";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input"; // Assuming this is correct
import type { AlertContextType, Alert } from "@/types/alerts-types"; // Assuming this is correct
export function AlertsPanel() {
  const { watchlists = [], deleteAlert } = useWatchlist();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const allAlerts: PriceAlert[] = [];
    (watchlists ?? []).forEach((watchlist) => {
      (watchlist.items ?? []).forEach((item) => {
        if (Array.isArray(item.alerts)) {
          item.alerts.forEach((alert) => {
            allAlerts.push({ ...alert, symbol: item.symbol });
          });
        }
      });
    });
    setAlerts(
      allAlerts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  }, [watchlists]);

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const toggleAlert = async (alertId: string, symbol: string) => {
    try {
      const res = await fetch("/api/watchlist/toggle-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, symbol }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast({ title: "Alert Updated", description: `Status changed.` });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update alert",
        variant: "destructive",
      });
    }
  };

  const filteredAlerts = useMemo(
    () =>
      alerts.filter((a) =>
        a.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [alerts, searchTerm]
  );

  const activeCount = useMemo(
    () => alerts.filter((a) => a.isActive).length,
    [alerts]
  );

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Price Alerts</span>
          </div>
          <Badge variant="secondary" className="bg-blue-600">
            {activeCount} active
          </Badge>
        </CardTitle>
        <div className="mt-2 flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white border-none"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <BellOff className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No alerts found</p>
            <p className="text-gray-500 text-sm">
              Try creating one from the watchlist
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  alert.triggeredAt
                    ? "bg-green-900/20 border-green-700"
                    : alert.isActive
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-800 border-gray-700 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-1 rounded ${
                        alert.condition === "above"
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      {alert.condition === "above" ? (
                        <TrendingUp className="h-3 w-3 text-white" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-white" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold text-sm">
                          {alert.symbol}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {alert.type} ${alert.value?.toFixed(2) ?? "0.00"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {alert.triggeredAt
                            ? `Triggered ${formatDate(alert.triggeredAt)}`
                            : `Created ${formatDate(alert.createdAt)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {alert.triggeredAt && (
                      <Badge
                        variant="secondary"
                        className="bg-green-600 text-xs"
                      >
                        Triggered
                      </Badge>
                    )}

                    {!alert.triggeredAt && (
                      <Switch
                        checked={alert.isActive}
                        onCheckedChange={() =>
                          toggleAlert(alert.id, alert.symbol)
                        }
                        className="scale-75"
                      />
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert?.(alert.id, alert.symbol)}
                      className="text-gray-400 hover:text-red-400 p-1 h-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
