"use client";

import { useState, useEffect } from "react";
import { AlertsManager } from "@/components/Alerts/AlertManager";
import { AlertsProvider } from "@/contexts/alerts-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function AlertsPage() {
  const [loading, setLoading] = useState(true);

  // Simulate loading delay (optional - replace with real loading trigger if needed)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131722] flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-3xl space-y-6">
          <Skeleton className="h-8 w-1/2 rounded bg-gray-700" />
          <Skeleton className="h-4 w-2/3 rounded bg-gray-700" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded bg-gray-700" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AlertsProvider>
      <div className="min-h-screen bg-[#131722] pt-20">
        <div className="container mx-auto px-4 py-10">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-white mb-2">📈 Price Alerts</h1>
            <p className="text-gray-400 text-lg">
              Create custom alerts to stay updated on market changes.
            </p>
          </div>
          <AlertsManager />
        </div>
      </div>
    </AlertsProvider>
  );
}
