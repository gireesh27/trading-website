"use client";

import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function AddMoney() {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    // console.log("Razorpay Key:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
    if (!amount || amount < 1) {
      alert("Enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/wallet/razorpay/create-order", {
        amount,
      });

      const { orderId } = res.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: amount * 100,
        currency: "INR",
        name: "TradeView",
        description: "Wallet Top-Up",
        order_id: orderId,
        handler: async function (response: any) {
          try {
            await axios.post("/api/wallet/razorpay/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount, // original amount in ₹
            });
            alert("Wallet credited successfully!");
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Verification failed. Contact support.");
          }
        },
        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/60 backdrop-blur-lg border border-slate-800 rounded-2xl shadow-2xl shadow-black/30 text-slate-100 w-full mx-auto border-white/20 relative overflow-hidden group transition-all duration-300">
      {/* Optional animated glowing background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-purple-500/10 to-pink-500/10 opacity-30 rounded-2xl blur-2xl group-hover:opacity-60 transition duration-500 z-0" />

      <div className="relative z-10">
        <CardHeader>
          <CardTitle className="text-xl  drop-shadow-sm tracking-wide bg-gradient-to-br from-slate-200 to-cyan-400 bg-clip-text text-transparent">
            Add Money to Wallet
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            type="number"
            placeholder="Enter amount (₹)"
            value={amount || ""}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 border border-white/30"
          />

          <Button
            onClick={handlePayment}
            disabled={loading || !amount}
            className="w-full text-sm capitalize rounded-md 
             bg-gradient-to-r from-cyan-500 to-blue-600
             hover:brightness-110 
             text-white font-semibold 
             shadow-md shadow-indigo-600 
             transition-all duration-200 
            "
          >
            {loading ? "Processing..." : "Pay with Razorpay"}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
