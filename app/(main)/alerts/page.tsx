"use client"
import { MainNav } from "@/components/main-nav";
import { AlertsManager } from "@/components/Alerts/AlertManager";
import { AlertsProvider } from "@/contexts/alerts-context";

export default function AlertsPage() {
  return (
    <AlertsProvider>
      <div className="min-h-screen bg-[#131722]">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Price Alerts</h1>
            <p className="text-gray-400">
              Set up and manage custom alerts to stay on top of market movements.
            </p>
          </div>
          <AlertsManager />
        </div>
      </div>
    </AlertsProvider>
  );
}