"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAlerts } from "@/contexts/alerts-context";
import { stockApi } from "@/lib/api/stock-api";
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

interface SymbolSuggestion {
  symbol: string;
  sector?: string;
  name: string;
}

export function AlertForm({ isOpen, onClose, alert, userId }: AlertFormProps) {
  const { toast } = useToast();
  const { addAlert, updateAlert } = useAlerts();

  const [type, setType] = useState<Alert["type"]>("price");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [value, setValue] = useState<string>(""); // maps to schema.value
  const [symbol, setSymbol] = useState("");
  const [sector, setSector] = useState("");
  const [suggestions, setSuggestions] = useState<SymbolSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Pre-fill form when editing
  useEffect(() => {
    if (alert) {
      setSymbol(alert.symbol);
      setType(alert.type);
      setSector(alert.sector || "");
      if (alert.type !== "news") {
        setCondition(alert.direction as "above" | "below");
        setValue(String(alert.targetPrice ?? ""));
      } else {
        setCondition("above");
        setValue("");
      }
    } else {
      setSymbol("");
      setSector("");
      setType("price");
      setCondition("above");
      setValue("");
    }
  }, [alert, isOpen]);

  // Debounced symbol search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const trimmed = symbol.trim();
      if (trimmed.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await stockApi.searchSymbol(trimmed);
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [symbol]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericValue = parseFloat(value);

    if (!symbol || (type !== "news" && isNaN(numericValue))) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoadingId("submit");

    try {
      const allSuggestions = await stockApi.searchSymbol(symbol.trim());
      const matched = allSuggestions.find(
        (s) => s.symbol.toUpperCase() === symbol.trim().toUpperCase()
      );

      if (!matched) {
        toast({
          title: "Invalid Symbol",
          description: `Symbol "${symbol}" not found.`,
          variant: "destructive",
        });
        setLoadingId(null);
        return;
      }

      const payload: any = {
        symbol: matched.symbol.toUpperCase(),
        sector: sector || "",
        type,
      };

      if (type !== "news") {
        payload.condition = condition;
        payload.value = numericValue;
      }

      if (alert) {
        await updateAlert({ ...alert, ...payload });
      } else {
        if (!userId) {
          console.error("User ID is missing for new alert.");
          setLoadingId(null);
          return;
        }
        await addAlert({ ...payload, userId });
      }

      toast({
        title: "Success",
        description: alert ? "Alert updated." : "Alert created.",
      });

      setSymbol("");
      setSector("");
      setSuggestions([]);
      setShowSuggestions(false);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save alert",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/90 backdrop-blur-md border border-gray-700 text-white max-w-md rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-wide flex items-center gap-2">
            {alert ? "✏️ Edit Alert" : "🚀 Create New Alert"}
          </DialogTitle>
          <p className="text-sm text-gray-400">
            Define your market alert conditions and we’ll notify you instantly.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Symbol */}
          <div className="grid grid-cols-4 items-start gap-4 relative">
            <Label htmlFor="symbol" className="text-right mt-2 text-gray-300">
              Symbol
            </Label>
            <div className="col-span-3 relative">
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="bg-gray-800/80 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Enter stock symbol"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((s) => (
                    <li
                      key={s.symbol}
                      className="p-2 hover:bg-gray-700 cursor-pointer flex justify-between transition"
                      onClick={() => {
                        setSymbol(s.symbol.toUpperCase());
                        setSector(s.sector || "");
                        setShowSuggestions(false);
                      }}
                    >
                      <span>{s.symbol}</span>
                      {s.sector && (
                        <span className="text-xs text-gray-400">{s.sector}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Sector */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sector" className="text-right text-gray-300">
              Sector
            </Label>
            <Input
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="col-span-3 bg-gray-800/80 border-gray-600 text-white"
              placeholder="Optional sector"
            />
          </div>

          {/* Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right text-gray-300">
              Type
            </Label>
            <Select value={type} onValueChange={(val) => setType(val as Alert["type"])}>
              <SelectTrigger className="col-span-3 bg-gray-800/80 border-gray-600 text-white">
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

          {/* Condition & Value */}
          {type !== "news" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="condition" className="text-right text-gray-300">
                  Condition
                </Label>
                <Select
                  value={condition}
                  onValueChange={(val) => setCondition(val as "above" | "below")}
                >
                  <SelectTrigger className="col-span-3 bg-gray-800/80 border-gray-600 text-white">
                    <SelectValue placeholder="Choose condition" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right text-gray-300">
                  Value
                </Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="e.g., 180.50"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="col-span-3 bg-gray-800/80 border-gray-600 text-white"
                />
              </div>
            </>
          )}

          {/* Footer */}
          <DialogFooter className="pt-4 border-t border-gray-700 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-full border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800/60 shadow-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md text-white"
              disabled={loadingId === "submit"}
            >
              {alert ? "Save Changes" : "Create Alert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
