"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

interface Withdrawal {
  _id: string;
  userId: string;
  amount: number;
  status: string;
  transferId?: string;
  createdAt: string;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  const fetchWithdrawals = async () => {
    const res = await axios.get("/api/admin/withdrawals");
    setWithdrawals(res.data);
  };

  const approveWithdrawal = async (id: string) => {
    try {
      const res = await axios.post("/api/admin/withdrawals/approve", {
        withdrawalId: id,
      });
      toast({ title: "Withdrawal Approved", description: `Txn ID: ${res.data.transferId}` });
      fetchWithdrawals();
    } catch (err: any) {
      toast({ title: "Approval Failed", description: err.response?.data?.error || "Unknown error", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Withdrawals</h1>
      {withdrawals.map((w) => (
        <div key={w._id} className="p-4 rounded-xl border border-white/10 bg-white/5">
          <div><strong>User:</strong> {w.userId}</div>
          <div><strong>Amount:</strong> ₹{w.amount}</div>
          <div><strong>Status:</strong> {w.status}</div>
          {w.transferId && <div><strong>Txn:</strong> {w.transferId}</div>}
          {w.status === "pending" && (
            <button
              onClick={() => approveWithdrawal(w._id)}
              className="mt-2 bg-green-600 px-3 py-1 rounded text-white hover:bg-green-700"
            >
              Approve Withdrawal
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
