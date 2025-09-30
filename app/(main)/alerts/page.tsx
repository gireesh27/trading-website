"use client";

import { useState } from "react";
import { AlertsManager } from "@/components/Alerts/AlertManager";
import { AlertsProvider } from "@/contexts/alerts-context";
import Loader from "@/components/loader";

export default function AlertsPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
    <div className="bg-[#131722] flex flex-col items-center justify-center pt-20">
        <Loader />
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
