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
    <div className="min-h-screen text-white mt-4 px-2 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-full w-full"
      >
        <Card className="shadow-xl p-2 overflow-x-hidden relative rounded-2xl border border-white/10 bg-black/50 pt-2 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Your Holdings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {loading ? (
              <div className="text-center py-10 animate-pulse text-gray-400">
                Loading holdings...
              </div>
            ) : holdings.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                No holdings found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[700px] md:min-w-full rounded-xl overflow-hidden border border-white/10 shadow-lg">
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-gray-900/50">
                      <TableHead
                        onClick={() => handleSort("symbol")}
                        className="cursor-pointer text-white font-semibold tracking-wide text-sm uppercase py-3 px-4 hover:text-cyan-400 min-w-[100px]"
                      >
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          Symbol
                        </span>
                        <SortIcon column="symbol" />
                      </TableHead>

                      <TableHead
                        onClick={() => handleSort("quantity")}
                        className="cursor-pointer text-white font-semibold tracking-wide text-sm uppercase py-3 px-4 hover:text-cyan-400 min-w-[70px]"
                      >
                        Qty
                        <SortIcon column="quantity" />
                      </TableHead>

                      <TableHead className="text-white font-semibold tracking-wide text-sm uppercase py-3 px-4 min-w-[90px] hidden sm:table-cell">
                        Avg Price
                      </TableHead>
                      <TableHead className="text-white font-semibold tracking-wide text-sm uppercase py-3 px-4 min-w-[110px] hidden sm:table-cell">
                        Current Price
                      </TableHead>
                      <TableHead className="text-white font-semibold tracking-wide text-sm uppercase py-3 px-4 min-w-[90px] hidden md:table-cell">
                        Invested
                      </TableHead>
                      <TableHead className="text-white font-semibold tracking-wide text-sm uppercase py-3 px-4 min-w-[110px] hidden md:table-cell">
                        Current Value
                      </TableHead>

                      <TableHead
                        onClick={() => handleSort("profitLossPercent")}
                        className="cursor-pointer text-white font-semibold tracking-wide text-sm uppercase py-3 px-4 hover:text-cyan-400 min-w-[90px]"
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
                        <TableCell className="font-bold text-white whitespace-nowrap">
                          {h.symbol}
                        </TableCell>
                        <TableCell className="text-gray-300 whitespace-nowrap">
                          {(h.quantity ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-gray-300 whitespace-nowrap hidden sm:table-cell">
                          ₹{(h.avgPrice ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-gray-300 whitespace-nowrap hidden sm:table-cell">
                          ₹{(h.currentPrice ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-gray-300 whitespace-nowrap hidden md:table-cell">
                          ₹{(h.totalInvested ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-gray-300 whitespace-nowrap hidden md:table-cell">
                          ₹{(h.currentValue ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell
                          className={`font-semibold whitespace-nowrap ${
                            (h.profitLoss ?? 0) >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          ₹{(h.profitLoss ?? 0).toFixed(2)} (
                          {(h.profitLossPercent ?? 0).toFixed(2)}%)
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
