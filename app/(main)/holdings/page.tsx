"use client";

import { useState, useEffect } from "react";
import HoldingsTable from "@/components/Holdings/HoldingTable";
import HoldingsChart from "@/components/Holdings/HoldingsChart";
import HoldingsPieChart from "@/components/Holdings/HoldingPieChart";
import PortfolioSummary from "@/components/Holdings/PortfolioSummary";
import HoldingsSummary from "@/components/Holdings/Sector";

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
        const res = await fetch(`/api/holdings/daily-prices/${selectedSymbol}`);
        const data = await res.json();

        console.log("API 5-min price history response:", data);

        // Transform API data to match chart's expected shape
        const history = data.map((p: any) => ({
          symbol: p.symbol,
          date: p.date,
          close: p.close,
          open: p.open,
          high: p.high,
          low: p.low,
          volume: p.volume,
          marketCap: p.marketCap,
          change: p.change,
          changePercent: p.changePercent,
          previousClose: p.previousClose,
        }));

        setPriceHistory(history);
      } catch (err) {
        console.error("Failed to load 5-min price history", err);
        setPriceHistory([]);
      } finally {
        setPriceLoading(false);
      }
    }

    fetchHistory();
  }, [selectedSymbol]);

  return (
    <div className="flex flex-col bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white px-6 py-10">
      <div className="flex h-screen gap-4 p-4 w-full ">
        {/* Table Section */}
        <div className="flex-1 rounded-xl border w-[60%]  border-gray-800 bg-gray-900/60 backdrop-blur">
          <HoldingsTable
            holdings={holdings}
            loading={loading}
            onRowClick={setSelectedSymbol}
          />
        </div>

        {/* Chart Section */}
        {selectedSymbol && (
          <div className="  rounded-xl border border-gray-800 bg-gray-900/60 backdrop-blur  w-[40%]">
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

      <div className="flex flex-row gap-4 p-4 mt-4 w-full">
        <div className="flex-1 overflow-auto rounded-xl  backdrop-blur w-[40%]">
          <HoldingsPieChart holdings={holdings} loading={loading} />
        </div>
        <div className="flex-1 overflow-auto rounded-xl  backdrop-blur w-[60%]">
          <PortfolioSummary holdings={holdings} />
          <HoldingsSummary holdings={holdings}/>
        </div>
      </div>
    </div>
  );
}
