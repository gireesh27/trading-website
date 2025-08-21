"use client";

import { useState, useEffect } from "react";
import HoldingsTable from "@/components/Holdings/HoldingTable";
import HoldingsChart from "@/components/Holdings/HoldingsChart";
import HoldingsPieChart from "@/components/Holdings/HoldingPieChart";
import DayChange from "@/components/Holdings/DayChange";
import TopWorstPerformer from "@/components/Holdings/topWorstPerformer";
import SectorAllocation from "@/components/Holdings/sectorAllocation";
import TotalPortfolioValue from "@/components/Holdings/TotalPortfolioValue";
import InvestedVsCurrent from "@/components/Holdings/InvestedCurrent";
import { calculatePortfolioStats } from "@/components/UtilFunctions/HoldingsSummary";
import Loading from "@/components/loader";
export default function Holdings() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [priceLoading, setPriceLoading] = useState(false);

  const { totalInvested, currentValue, profitLossValue, profitLossPercent } =
    calculatePortfolioStats(holdings);

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

        const history = data.map((p: any) => ({
          symbol: p.symbol,
          sector: p.sector,
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

  if (loading)
    return (
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        <Loading />
      </div>
    );

  return (
    <div className="flex flex-col bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white min-h-screen pt-20 px-4 gap-6">
      {/* 🔹 Top Summary Row */}
      <div className="flex flex-col md:flex-row border border-gray-700 rounded-lg gap-6 p-1 md:p-2">
        <div className="flex-1 flex items-center">
          <TopWorstPerformer holdings={holdings} />
        </div>
        <div className="flex flex-col sm:flex-row md:flex-nowrap gap-4 justify-end flex-1">
          <InvestedVsCurrent
            totalInvested={totalInvested}
            currentValue={currentValue}
            profitLossValue={profitLossValue}
            profitLossPercent={profitLossPercent}
          />
          <DayChange holdings={holdings} />
          <TotalPortfolioValue currentValue={currentValue} />
        </div>
      </div>

      {/* 🔹 Main Content: Table + Chart */}
      <div className="flex flex-col lg:flex-row min-h-[30rem]  bg-gray-900/60 rounded-lg overflow-auto shadow-inner">
        {/* Table Section */}
          <HoldingsTable
            holdings={holdings}
            loading={loading}
            onRowClick={setSelectedSymbol}
          />
       
        {/* Chart Section */}
        {selectedSymbol && (
          <div className="bg-gray-900/60 flex-0 backdrop-blur rounded-lg p-2 w-full lg:w-2/5 min-h-[20rem] flex flex-col justify-center">
            {priceLoading ? (
              <p className="text-gray-400 text-center">
                Loading price history...
              </p>
            ) : priceHistory.length ? (
              <HoldingsChart
                symbol={selectedSymbol}
                priceHistory={priceHistory}
                buyPrice={1000}
                sellPrice={2000}
              />
            ) : (
              <p className="text-gray-400 text-center">
                No price history data available.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 🔹 Bottom Pie and Sector Allocation */}
      <div className="flex flex-col xl:flex-row items-stretch justify-between ">
        <div className="w-full xl:w-1/2  rounded-lg ">
          <HoldingsPieChart holdings={holdings} loading={loading} />
        </div>
        <div className="w-full xl:w-1/2 rounded-lg ">
          <SectorAllocation holdings={holdings} />
        </div>
      </div>
    </div>
  );
}
