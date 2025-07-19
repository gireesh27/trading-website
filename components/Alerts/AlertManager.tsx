"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AlertForm } from "./AlertForm";
import { AlertsList } from "./AlertsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Alert } from "@/types/alerts-types";

export function AlertsManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAlert(null);
  };

  return (
    <div>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Your Alerts</CardTitle>
          <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </CardHeader>
        <CardContent>
          <AlertsList onEdit={handleEdit} />
        </CardContent>
      </Card>

      {isFormOpen && (
        <AlertForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          alert={editingAlert}
        />
      )}
    </div>
  );
}