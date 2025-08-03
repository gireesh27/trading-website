"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function WithdrawPage() {
  const { toast } = useToast();

  const [amount, setAmount] = useState("");
  const [bank, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    try {
      const res = await fetch("/api/wallet/cashfree/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          bank: bank,
          ifsc: ifsc,
          name: name,
          phone: phone,
          email: email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Withdrawal failed");

      toast({
        title: "Withdrawal Successful",
        description: "Funds are being transferred to your bank account.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Withdrawal Failed",
        description: err?.message || "Please try again later.",
      });
    }
  };
  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <Card className="rounded-2xl border border-gray-700 bg-gradient-to-br from-[#1f1f1f]/80 to-[#131722]/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.25)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition duration-300">
        <CardContent className="space-y-4 pt-6 px-6 pb-8">
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            💸 Withdraw From Wallet
          </h2>

          <Input
            placeholder="Amount"
            type="number"
            className="bg-black/30 border border-gray-600 text-white placeholder:text-gray-400"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Input
            placeholder="Bank Account Number"
            className="bg-black/30 border border-gray-600 text-white placeholder:text-gray-400"
            value={bank}
            onChange={(e) => setBankAccount(e.target.value)}
          />

          <Input
            placeholder="IFSC Code"
            className="bg-black/30 border border-gray-600 text-white placeholder:text-gray-400"
            value={ifsc}
            onChange={(e) => setIfsc(e.target.value)}
          />

          <Input
            placeholder="Name"
            className="bg-black/30 border border-gray-600 text-white placeholder:text-gray-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Phone"
            className="bg-black/30 border border-gray-600 text-white placeholder:text-gray-400"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            placeholder="Email"
            className="bg-black/30 border border-gray-600 text-white placeholder:text-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:brightness-110 transition-all duration-200"
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? "Processing..." : "Withdraw"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
