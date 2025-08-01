// components/GetSubscriptionCard.tsx
"use client";

import { useWallet } from "@/contexts/wallet-context";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface GetSubscriptionCardProps {
  amount: number;
  planName: string;
}

export default function GetSubscriptionCard({
  amount,
  planName,
}: GetSubscriptionCardProps) {
  const { addMoney } = useWallet();

  const handleSubscription = async () => {
    try {
      await addMoney(amount);
      toast({
        title: "Subscription Activated",
        description: `You added ₹${amount} to your wallet for ${planName}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Subscription failed. Try again later.",
      });
    }
  };

  return (
    <Card
      onClick={handleSubscription}
      className="relative cursor-pointer group overflow-hidden rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md transition-all duration-300 hover:shadow-indigo-500/50 hover:border-indigo-500"
    >
      {/* Animated glow background */}
      <div className="absolute inset-0 z-0 rounded-2xl bg-gradient-to-br from-indigo-400/10 via-purple-500/10 to-pink-500/10 opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500" />

      <CardContent className="relative z-10 p-6 flex flex-col items-center text-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/20 backdrop-blur-md">
          <Sparkles className="h-6 w-6 text-indigo-300 group-hover:scale-125 group-hover:text-indigo-400 transition-transform duration-300" />
        </div>

        <h2 className="text-lg font-bold text-white tracking-wide">
          {planName}
        </h2>
        <p className="text-sm text-indigo-100">₹{amount} / one-time</p>

        <Button
          variant="default"
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-semibold shadow-md hover:brightness-110 hover:scale-[1.02] transition-transform duration-300"
        >
          Get Subscription
        </Button>
      </CardContent>
    </Card>
  );
}
