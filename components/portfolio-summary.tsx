"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function PortfolioSummary() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalValue: number;
    availableFunds: number;
    profitLoss: number;
    chartData: number[];
    chartLabels: string[];
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/portfolio");
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to fetch portfolio summary");
        setData(json);
      } catch (err) {
        console.error("Portfolio summary fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-gray-400 text-center py-6">Loading portfolio summary...</p>;
  }

  if (!data) {
    return <p className="text-red-500 text-center py-6">Failed to load portfolio summary.</p>;
  }

  const lineData = {
    labels: data.chartLabels,
    datasets: [
      {
        label: "Portfolio Value",
        data: data.chartData,
        fill: false,
        borderColor: "#3b82f6",
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-white">
          <div>
            <p className="text-sm text-gray-400">Total Value</p>
            <p className="text-xl font-bold">₹{data.totalValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Available Funds</p>
            <p className="text-xl font-bold">₹{data.availableFunds.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">P&L</p>
            <p
              className={`text-xl font-bold ${
                data.profitLoss >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              ₹{data.profitLoss.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-6 h-60">
          <Line data={lineData} options={lineOptions} />
        </div>
      </CardContent>
    </Card>
  );
}
