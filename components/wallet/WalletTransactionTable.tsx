"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/contexts/wallet-context";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import TransactionsCard from "./TransactionsCard";
type SortKey = "createdAt" | "type" | "symbol" | "source" | "status" | "amount";
type SortOrder = "asc" | "desc";

export default function WalletTransactionTable() {
  const { transactions, isLoading: loading } = useWallet();

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (sortKey === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }

      const aStr = String(aVal ?? "").toLowerCase();
      const bStr = String(bVal ?? "").toLowerCase();

      return sortOrder === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [transactions, sortKey, sortOrder]);

  if (loading) {
    return (
      <Card className="p-6 bg-muted/30 shadow-lg rounded-2xl border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Loading Wallet Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
        </CardContent>
      </Card>
    );
  }

  if (!transactions.length) {
    return (
      <Card className="p-6 bg-muted/30 shadow-lg rounded-2xl border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Wallet Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No transactions found.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderSortArrow = (key: SortKey) => {
    if (key !== sortKey) return null;
    return <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl text-white">
      <CardHeader className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-2xl font-bold text-white tracking-wide bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-pulse drop-shadow-md">
            Complete Transaction History
          </CardTitle>

          <div className="flex justify-end px-6 pt-4">
            <TransactionsCard transactions={transactions} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-2 overflow-x-auto">
        <div
          id="transaction-print-area"
          className="max-h-[500px] overflow-y-auto custom-scrollbar print:max-h-full print:overflow-visible"
        >
          <Table>
            <TableHeader>
              <TableRow className="text-sm border-b border-white/10 backdrop-blur-md bg-white/5 text-white/80">
                {[
                  { key: "createdAt", label: "Date" },
                  { key: "type", label: "Type" },
                  { key: "symbol", label: "Symbol" },
                  { key: "source", label: "Source" },
                  { key: "status", label: "Status" },
                  { key: "amount", label: "Amount", alignRight: true },
                ].map(({ key, label, alignRight }) => (
                  <TableHead
                    key={key}
                    onClick={() => handleSort(key as SortKey)}
                    className={cn(
                      "cursor-pointer select-none px-4 py-2 text-white/90 font-medium transition-all duration-300 ease-in-out hover:text-blue-400 hover:underline tracking-wide",
                      alignRight && "text-right"
                    )}
                  >
                    {label} {renderSortArrow(key as SortKey)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedTransactions.map((tx) => (
                <TableRow
                  key={
                    (tx._id ?? tx._id)?.toString() ??
                    `${tx.type}-${tx.createdAt}`
                  }
                  className="hover:bg-white/5 transition-colors"
                >
                  <TableCell className="text-sm text-gray-300">
                    {tx.createdAt
                      ? format(new Date(tx.createdAt), "dd/MM/yy, hh:mm a")
                      : "N/A"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        tx.type === "credit"
                          ? "border-green-400 text-green-400"
                          : "border-red-400 text-red-400"
                      )}
                    >
                      {tx.type.toUpperCase()}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm text-gray-200">
                    {tx.symbol || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-200 capitalize">
                    {tx.source || "-"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        tx.status === "completed"
                          ? "bg-green-500/20 text-green-300"
                          : tx.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-red-500/20 text-red-400"
                      )}
                    >
                      {tx.status?.toUpperCase()}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm text-right font-medium">
                    <span
                      className={cn(
                        tx.type === "credit" ? "text-green-400" : "text-red-400"
                      )}
                    >
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
