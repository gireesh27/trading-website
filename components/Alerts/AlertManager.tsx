"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AlertForm } from "./AlertForm";
import { AlertsList } from "./AlertsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Alert } from "@/types/alerts-types";

export function AlertsManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAlert(null);
  };

  if (status === "loading") {
    return <p className="text-gray-400 text-center py-6">Loading session...</p>;
  }

  return (
    <div>
      <Card className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl shadow-lg">
        {/* Decorative Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

        <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
          <div>
            {/* Creative Animated Heading */}
            <CardTitle className="text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
              📊 Your Smart Alerts
            </CardTitle>

            {/* Innovative Description */}
            <p className="mt-1 text-sm text-gray-300">
              Stay ahead of the market — your active alerts will notify you when{" "}
              <span className="font-medium text-blue-400">
                key price levels
              </span>{" "}
              or{" "}
              <span className="font-medium text-pink-400">percent changes</span>{" "}
              occur.
            </p>
          </div>

          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 rounded-full"
          >
            <PlusCircle className="h-4 w-4" />
            Create Alert
          </Button>
        </CardHeader>

        <CardContent className="relative z-10 p-4">
          <AlertsList onEdit={handleEdit} />
        </CardContent>
      </Card>

      {isFormOpen && (
        <AlertForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          alert={editingAlert}
          userId={userId}
        />
      )}
    </div>
  );
}
