"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect } from "react";

interface Holding {
  sector?: string;
  currentPrice: number;
  quantity: number;
}

interface SectorData {
  name: string;
  value: number;
}

const COLORS = ["#4ade80", "#60a5fa"]; // green and blue for two sectors

export default function SectorAllocation({ holdings }: { holdings: Holding[] }) {
  // Aggregate sector values
  const sectorAllocation = holdings.reduce((acc: { [key: string]: number }, h) => {
    const sector = h.sector?.toLowerCase() === "crypto" ? "crypto" : "markets";
    const value = h.currentPrice * h.quantity;
    acc[sector] = (acc[sector] || 0) + value;
    return acc;
  }, {});

  const sectorData: SectorData[] = Object.entries(sectorAllocation).map(([name, value]) => ({
    name,
    value,
  }));

  // DEBUG: Log data to verify it's correct
  useEffect(() => {
    console.log("sectorData", sectorData);
  }, [sectorData]);

  return (
    <div className="bg-gray-900 p-4 rounded-lg w-full max-w-md mx-auto" style={{ minHeight: 320 }}>
      <h2 className="text-gray-400 mb-4 text-center text-lg font-semibold">Sector Allocation</h2>

      {sectorData.length === 0 ? (
        <p className="text-gray-500 text-center">No holdings data available.</p>
      ) : (
        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sectorData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                stroke="#1f2937"
                strokeWidth={2}
                label
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31,41,55,0.9)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value) => [`₹${Number(value).toLocaleString()}`]}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ color: "#fff", fontSize: 14 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
