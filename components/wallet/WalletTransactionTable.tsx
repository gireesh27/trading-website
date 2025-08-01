"use client";

import { useWallet } from "@/contexts/wallet-context";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types/Transaction";
export default function WalletTransactionTable() {
  const { transactions } = useWallet();

  if (!transactions.length)
    return (
      <p className="text-sm text-muted-foreground">No transactions yet.</p>
    );

  return (
    <div className="rounded-xl bg-black/40 p-4 border border-white/10 shadow-xl">
      <h2 className="text-lg font-semibold text-white mb-4">
        Wallet Transaction History
      </h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white/70">Date</TableHead>
              <TableHead className="text-white/70">Type</TableHead>
              <TableHead className="text-white/70">Symbol</TableHead>
              <TableHead className="text-white/70">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody >
            {transactions.map((tx) => (
              <TableRow
               key={(tx.id ?? (tx as Transaction).id)?.toString() ?? `${tx.type}-${tx.createdAt}`}
                className="border-t border-white/10"
              >
                <TableCell className="text-white/90 text-xs">
                  {tx.createdAt
                    ? format(new Date(tx.createdAt), "dd/MM/yy, hh:mm a")
                    : "N/A"}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-medium text-xs",
                    tx.type === "credit" ? "text-green-400" : "text-red-400"
                  )}
                >
                  {tx.type.toUpperCase()}
                </TableCell>
                <TableCell className="text-white/90 text-xs">
                  {tx.symbol || "-"}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-medium text-xs",
                    tx.type === "credit" ? "text-green-400" : "text-red-400"
                  )}
                >
                  ₹{tx.amount.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
