"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PricePoint {
  date: string;
  price: number;
}

interface Props {
  symbol: string;
  priceHistory: PricePoint[];
}

export default function HoldingPriceChart({ symbol, priceHistory }: Props) {
  // Format dates for X-axis
  const data = priceHistory.map((p) => ({
    date: new Date(p.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    price: p.price
  }));

  return (
    <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-lg">{symbol} Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#ccc" />
              <YAxis stroke="#ccc" domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111", border: "1px solid #444" }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#0ff" }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#00f0ff"
                strokeWidth={2}
                dot={{ r: 3, fill: "#00f0ff" }}
                activeDot={{ r: 6, fill: "#0ff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
