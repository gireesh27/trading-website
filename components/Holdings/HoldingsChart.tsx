"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from "recharts";
import WalletBalance from "../wallet/WalletBalance";

type Holding = {
  symbol: string;
  buyDate: string;
  sellDate: string;
  holdingPeriod: number;
  profitLoss: number;
};

export default function HoldingsChart() {
  const [data, setData] = useState<Holding[]>([]);

  useEffect(() => {
    fetch("/api/wallet/analytics")
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
      });
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Holdings P&L & Duration</h2>
      <WalletBalance />
      
      {/* <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="symbol" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="profitLoss" stroke="#4ade80" name="P&L" />
        </LineChart>
      </ResponsiveContainer> */}
    </div>
  );
}
