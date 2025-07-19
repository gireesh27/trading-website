"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Line } from "react-chartjs-2"
import { useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

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
  const [portfolio, setPortfolio] = useState({
    totalValue: 152342.76,
    availableFunds: 34500.00,
    profitLoss: 13242.76,
    chartData: [125000, 126500, 128000, 130200, 132000, 137500, 152342],
  })

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"],
    datasets: [
      {
        label: "Portfolio Value",
        data: portfolio.chartData,
        fill: false,
        borderColor: "#3b82f6",
        tension: 0.4,
      },
    ],
  }

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
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        }
      },
      y: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        }
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
            <p className="text-xl font-bold">₹{portfolio.totalValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Available Funds</p>
            <p className="text-xl font-bold">₹{portfolio.availableFunds.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">P&L</p>
            <p className="text-xl font-bold text-green-400">₹{portfolio.profitLoss.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-6 h-60">
          <Line data={lineData} options={lineOptions} />
        </div>
      </CardContent>
    </Card>
  )
}