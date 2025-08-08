"use client";

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

export default function HoldingsTable({
  holdings,
  loading,
  onRowClick
}: {
  holdings: Holding[];
  loading: boolean;
  onRowClick: (symbol: string) => void;
}) {
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
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              📊 My Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 animate-pulse text-gray-400">
                Loading holdings...
              </div>
            ) : holdings.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                No holdings found
              </div>
            ) : (
              <Table className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
                <TableHeader>
                  <TableRow className="border-b border-white/10">
                    {["Symbol", "Qty", "Avg Price", "Current Price", "Invested", "Current Value", "P/L"]
                      .map((head, i) => (
                        <TableHead
                          key={i}
                          className="text-white font-semibold tracking-wide text-sm uppercase py-3 px-4 backdrop-blur-md border-b border-white/10 shadow-sm"
                        >
                          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            {head}
                          </span>
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {holdings.map((h, i) => (
                    <motion.tr
                      key={`${h.symbol}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/5 transition-colors duration-300 border-b border-white/5 cursor-pointer"
                      onClick={() => onRowClick(h.symbol)}
                    >
                      <TableCell className="font-bold text-white">{h.symbol}</TableCell>
                      <TableCell className="text-gray-300">{h.quantity}</TableCell>
                      <TableCell className="text-gray-300">₹{h.avgPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-gray-300">₹{h.currentPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-gray-300">₹{h.totalInvested.toFixed(2)}</TableCell>
                      <TableCell className="text-gray-300">₹{h.currentValue.toFixed(2)}</TableCell>
                      <TableCell
                        className={cn(
                          h.profitLoss >= 0
                            ? "text-green-400"
                            : "text-red-400",
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
