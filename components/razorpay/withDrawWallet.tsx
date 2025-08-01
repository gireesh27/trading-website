"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

const WithdrawForm = () => {
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    bankAccount: "",
    ifsc: "",
    amount: "",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { name, phone, email, bankAccount, ifsc, amount, remarks } = formData;

    // Validation
    if ( !name || !phone || !email || !bankAccount || !ifsc || !amount) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }

    if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      toast({ title: "Invalid email format", variant: "destructive" });
      return;
    }

    if (Number(amount) <= 0) {
      toast({ title: "Amount must be greater than 0", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const beneId = `bene_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

      const res = await fetch("/api/wallet/cashfree/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          
          name,
          phone,
          email,
          bankAccount,
          ifsc,
          amount: Number(amount),
          beneId,
          remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Withdrawal failed");

      toast({
        title: "Withdrawal successful",
        description: `Txn ID: ${data.transferId}`,
      });

      setFormData({
        name: "",
        phone: "",
        email: "",
        bankAccount: "",
        ifsc: "",
        amount: "",
        remarks: "",
      });
    } catch (err: any) {
      toast({
        title: "Withdrawal failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20 relative overflow-hidden group transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-blue-500/20 opacity-30 rounded-2xl blur-2xl group-hover:opacity-60 transition duration-500 z-0" />
      <div className="relative z-10 space-y-4">
        <h2 className="text-2xl font-bold text-white drop-shadow-sm tracking-wide">Withdraw Funds</h2>

        <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 border border-white/30" />
        <Input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 border border-white/30" />
        <Input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 border border-white/30" />
        <Input name="bankAccount" placeholder="Bank Account Number" value={formData.bankAccount} onChange={handleChange} className="bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 border border-white/30" />
        <Input name="ifsc" placeholder="IFSC Code" value={formData.ifsc} onChange={handleChange} className="bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 border border-white/30" />
        <Input name="amount" placeholder="Amount" type="number" value={formData.amount} onChange={handleChange} className="bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 border border-white/30" />

        <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:brightness-110 text-white font-semibold shadow-md shadow-indigo-600">
          {loading ? "Processing..." : "Withdraw"}
        </Button>
      </div>
    </div>
  );
};

export default WithdrawForm;
