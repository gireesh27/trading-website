"use client";

import { useEffect, useState } from "react";

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  source: string;
  status: string;
  createdAt: string;
}

export default function BankTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/wallet/cashfree/bank");
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error("Failed to load bank transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <div>Loading bank transactions...</div>;

  if (transactions.length === 0)
    return <div className="text-gray-500 text-sm">No bank transactions found.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Bank Transactions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transactions.map((txn) => (
          <div
            key={txn._id}
            className="rounded-xl border p-4 shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium capitalize">{txn.type}</span>
              <span
                className={`text-sm px-2 py-1 rounded-full ${
                  txn.status === "success"
                    ? "bg-green-100 text-green-700"
                    : txn.status === "failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {txn.status}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Source: {txn.source}
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Amount: ₹{txn.amount}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {new Date(txn.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
