"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

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

type SortKey = "symbol" | "quantity" | "profitLossPercent" | null;
type SortOrder = "asc" | "desc";

export default function HoldingsTable({
  holdings,
  loading,
  onRowClick,
}: {
  holdings: Holding[];
  loading: boolean;
  onRowClick: (symbol: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const sortedHoldings = useMemo(() => {
    if (!sortKey) return holdings;
    return [...holdings].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      return 0;
    });
  }, [holdings, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="inline h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="inline h-4 w-4 ml-1" />
    );
  };

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
                  <TableRow className="border-b border-white/10 hover:bg-gray-900/50">
                    <TableHead
                      onClick={() => handleSort("symbol")}
                      className="cursor-pointer text-white font-semibold tracking-wide text-sm uppercase py-3 px-4 hover:text-cyan-400"
                    >
                      <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Symbol
                      </span>
                      <SortIcon column="symbol" />
                    </TableHead>

                    <TableHead
                      onClick={() => handleSort("quantity")}
                      className="cursor-pointer text-white font-semibold tracking-wide text-sm uppercase py-3 px-4 hover:text-cyan-400"
                    >
                      Qty
                      <SortIcon column="quantity" />
                    </TableHead>

                    <TableHead className="text-white font-semibold tracking-wide text-sm uppercase py-3 px-4">
                      Avg Price
                    </TableHead>
                    <TableHead className="text-white font-semibold tracking-wide text-sm uppercase py-3 px-4">
                      Current Price
                    </TableHead>
                    <TableHead className="text-white font-semibold tracking-wide text-sm uppercase py-3 px-4">
                      Invested
                    </TableHead>
                    <TableHead className="text-white font-semibold tracking-wide text-sm uppercase py-3 px-4">
                      Current Value
                    </TableHead>

                    <TableHead
                      onClick={() => handleSort("profitLossPercent")}
                      className="cursor-pointer text-white font-semibold  tracking-wide text-sm uppercase py-3 px-4 hover:text-cyan-400"
                    >
                      P/L %
                      <SortIcon column="profitLossPercent" />
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {sortedHoldings.map((h, i) => (
                    <motion.tr
                      key={`${h.symbol}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/5 transition-colors duration-300 border-b border-white/5 cursor-pointer"
                      onClick={() => onRowClick(h.symbol)}
                    >
                      <TableCell className="font-bold text-white">
                        {h.symbol}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {h.quantity.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        ₹{h.avgPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        ₹{h.currentPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        ₹{h.totalInvested.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        ₹{h.currentValue.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          h.profitLoss >= 0 ? "text-green-400" : "text-red-400",
                          "font-semibold"
                        )}
                      >
                        ₹{h.profitLoss.toFixed(2)} (
                        {h.profitLossPercent.toFixed(2)}%)
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
