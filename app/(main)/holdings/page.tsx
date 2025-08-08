"use client";

import { useState, useEffect } from "react";
import HoldingsTable from "@/components/Holdings/HoldingTable";
import HoldingsChart from "@/components/Holdings/HoldingsChart";

export default function Holdings() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [priceLoading, setPriceLoading] = useState(false);

  // Fetch holdings on mount
  useEffect(() => {
    async function fetchHoldings() {
      setLoading(true);
      try {
        const res = await fetch("/api/holdings");
        const data = await res.json();
        setHoldings(data?.holdings || []);
      } catch (err) {
        console.error("Failed to load holdings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHoldings();
  }, []);

  // Fetch price history when symbol is selected
  useEffect(() => {
    if (!selectedSymbol) return;

    setPriceLoading(true);

    async function fetchHistory() {
      try {
        const res = await fetch(
          `/api/holdings/price-history?symbol=${selectedSymbol}`
        );
        const data = await res.json();

        console.log("API price history response:", data);

        setPriceHistory(data.priceHistory || []);
      } catch (err) {
        console.error("Failed to load price history", err);
        setPriceHistory([]);
      } finally {
        setPriceLoading(false);
      }
    }

    fetchHistory();
  }, [selectedSymbol]);

  return (
    <div className="flex h-screen gap-4 p-4 bg-gray-950">
      {/* Table Section */}
      <div className="flex-1 overflow-auto rounded-xl border border-gray-800 bg-gray-900/60 backdrop-blur">
        <HoldingsTable
          holdings={holdings}
          loading={loading}
          onRowClick={setSelectedSymbol}
        />
      </div>

      {/* Chart Section */}
      {selectedSymbol && (
        <div className="flex-1 overflow-auto rounded-xl border border-gray-800 bg-gray-900/60 backdrop-blur">
          {priceLoading ? (
            <p className="text-gray-400 p-4">Loading price history...</p>
          ) : priceHistory.length ? (
            <HoldingsChart
              symbol={selectedSymbol}
              priceHistory={priceHistory}
              buyPrice={1000}
              sellPrice={2000}
            />
          ) : (
            <p className="text-gray-400 p-4">
              No price history data available.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
