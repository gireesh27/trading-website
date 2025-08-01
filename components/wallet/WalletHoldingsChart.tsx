"use client";

import { useWallet } from "@/contexts/wallet-context";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function WalletHoldingsChart() {
const { analytics } = useWallet();

if (!analytics?.dailyPLHistory?.length) return <p className="text-muted">No holdings data yet.</p>;

  return (
    <div className="rounded-xl bg-white/5 p-4 border border-white/10 shadow-xl">
      <h2 className="text-lg font-semibold text-white mb-4">Holdings P&L Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
       <LineChart data={analytics.dailyPLHistory}>

          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="pnl" stroke="#10B981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
