"use client"

import { useWallet } from "@/contexts/wallet-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import { useState, useMemo } from "react";

export function TransactionsTable() {
  const { transactions } = useWallet();
  const [filters, setFilters] = useState({ type: "all", search: "" });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType =
        filters.type === "all" ? true : tx.type.toLowerCase() === filters.type;
      const matchesSearch =
        filters.search === "" ||
        (tx.symbol && tx.symbol.toLowerCase().includes(filters.search.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [transactions, filters]);

  const exportToCSV = () => {
    const header = "Date,Type,Symbol,Quantity,Price,Amount,Status\n";
    const rows = filteredTransactions.map((tx) =>
      [
        new Date(tx.date).toLocaleString(),
        tx.type,
        tx.symbol || "-",
        tx.quantity || "-",
        tx.price?.toFixed(2) || "-",
        (tx.amount > 0 ? "+" : "-") + "$" + Math.abs(tx.amount).toFixed(2),
        tx.status,
      ].join(",")
    );
    const csvContent = header + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle className="text-white">Recent Transactions</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Search Symbol..."
              className="bg-gray-700 border-gray-600"
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
            />
            <Select
              defaultValue="all"
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, type: value }))
              }
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdraw">Withdraw</SelectItem>
                <SelectItem value="dividend">Dividend</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="bg-transparent border-gray-600"
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Type</TableHead>
              <TableHead className="text-white">Details</TableHead>
              <TableHead className="text-right text-white">Amount</TableHead>
              <TableHead className="text-right text-white">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-gray-400">
                    {new Date(tx.date).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium text-white">{tx.type}</TableCell>
                  <TableCell className="text-gray-300">
                    {tx.symbol
                      ? `${tx.quantity} shares of ${tx.symbol} @ $${tx.price?.toFixed(2)}`
                      : "-"}
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${
                      tx.amount > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-white">{tx.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
