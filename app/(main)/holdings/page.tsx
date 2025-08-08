"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Holding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  totalInvested: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export default function HoldingsPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch holdings from backend
  useEffect(() => {
    async function fetchHoldings() {
      try {
        const res = await fetch("/api/holdings"); // Your backend API
        const data = await res.json();
        setHoldings(data);
      } catch (err) {
        console.error("Failed to load holdings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHoldings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">📊 My Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 animate-pulse text-gray-400">Loading holdings...</div>
            ) : holdings.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No holdings found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Symbol</TableHead>
                    <TableHead className="text-white">Qty</TableHead>
                    <TableHead className="text-white">Avg Price</TableHead>
                    <TableHead className="text-white">Current Price</TableHead>
                    <TableHead className="text-white">Invested</TableHead>
                    <TableHead className="text-white">Current Value</TableHead>
                    <TableHead className="text-white">P/L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdings.map((h, i) => (
                    <motion.tr
                      key={h.symbol}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/10 transition-colors"
                    >
                      <TableCell className="font-bold">{h.symbol}</TableCell>
                      <TableCell>{h.quantity}</TableCell>
                      <TableCell>₹{h.avgPrice.toFixed(2)}</TableCell>
                      <TableCell>₹{h.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>₹{h.totalInvested.toFixed(2)}</TableCell>
                      <TableCell>₹{h.currentValue.toFixed(2)}</TableCell>
                      <TableCell
                        className={cn(
                          h.profitLoss >= 0 ? "text-green-400" : "text-red-400",
                          "font-semibold"
                        )}
                      >
                        ₹{h.profitLoss.toFixed(2)} ({h.profitLossPercent.toFixed(2)}%)
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
