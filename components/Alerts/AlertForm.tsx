"use client";

import { useState, useEffect } from "react";
import { useAlerts } from "@/contexts/alerts-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Alert } from "@/types/alerts-types";

interface AlertFormProps {
  isOpen: boolean;
  onClose: () => void;
  alert?: Alert | null;
  userId?: string | null;
}

export function AlertForm({ isOpen, onClose, alert, userId }: AlertFormProps) {
  const { addAlert, updateAlert } = useAlerts();
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState<Alert["type"]>("price");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState("");

  useEffect(() => {
    if (alert) {
      setSymbol(alert.symbol);
      setType(alert.type);
      if (alert.type !== "news") {
        setDirection(alert.direction);
        setTargetPrice(String(alert.targetPrice));
      }
    } else {
      setSymbol("");
      setType("price");
      setDirection("above");
      setTargetPrice("");
    }
  }, [alert, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(targetPrice);

    if (!symbol || (type !== "news" && isNaN(priceValue))) return;

    const payload: any = {
      symbol: symbol.toUpperCase(),
      type,
    };

    if (type !== "news") {
      payload.direction = direction;
      payload.targetPrice = priceValue;
    }

    if (alert) {
      await updateAlert({ ...alert, ...payload });
    } else {
      if (!userId) {
        console.error("User ID is missing for new alert.");
        return;
      }
      await addAlert({ ...payload, userId });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {alert ? "Edit Alert" : "Create New Alert"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="symbol" className="text-right">
              Symbol
            </Label>
            <Input
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="col-span-3 bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select
              value={type}
              onValueChange={(val) => setType(val as Alert["type"])}
            >
              <SelectTrigger className="col-span-3 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Choose type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="percent_change">Percentage Change</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="news" disabled>News (coming soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type !== "news" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="direction" className="text-right">
                  Direction
                </Label>
                <Select
                  value={direction}
                  onValueChange={(val) =>
                    setDirection(val as "above" | "below")
                  }
                >
                  <SelectTrigger className="col-span-3 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Choose condition" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="targetPrice" className="text-right">
                  Target Price
                </Label>
                <Input
                  id="targetPrice"
                  type="number"
                  placeholder="e.g., 180.50"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="col-span-3 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {alert ? "Save Changes" : "Create Alert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
