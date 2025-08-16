"use client";
import { useEffect, useState } from "react";
import { WalletProvider, useWallet } from "@/contexts/wallet-context";
import { motion } from "framer-motion";
import Loader from "@/components/loader";
import AddMoneyButton from "@/components/razorpay/handleAddMoney";
import CreateWalletPasswordForm from "@/components/wallet/CreateWalletPasswordForm";
import PaymentForm from "@/components/razorpay/payuAdd";
import WithdrawForm from "@/components/razorpay/withdrawForm";
import WalletTransactionTable from "@/components/wallet/WalletTransactionTable";
import { useAuth } from "@/contexts/auth-context";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Button } from "@/components/ui/button";
function WalletPageContent() {
  const { user, isLoading: authLoading } = useAuth();

  // ✅ Hooks always run
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wallet/balance");
      const data = await res.json();
      setBalance(data.walletBalance ?? 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // 🚦 Return early after hooks are declared
  if (authLoading || !user) {
    return (
      <div className="bg-[#131722] flex flex-col items-center justify-center pt-20">
        <Loader />
      </div>
    );
  }
  return (
    <div className="relative  bg-[#0e0f1a] items-center justify-center mx-auto  pt-20">
      <BackgroundBeamsWithCollision className=" fixed inset-0 z-0 w-full h-full pointer-events-none bg-gradient-to-br from-[#1a1c2b]/90 via-[#2a2c3d]/70 to-[#1a1c2b]/90">
        <div className="w-96 h-96 bg-purple-500 opacity-30 blur-3xl rounded-full" />
        <div className="w-96 h-96 bg-blue-500 opacity-30 blur-2xl rounded-full" />
        <div className="w-96 h-96 bg-pink-500 opacity-30 blur-xl rounded-full" />
        <div className="w-96 h-96 bg-red-500 opacity-30 blur-2xl rounded-full" />
        <div className="w-96 h-96 bg-yellow-500 opacity-30 blur-3xl rounded-full" />
      </BackgroundBeamsWithCollision>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
      >
        {/* Left: Heading & Subheading */}
        <div className="mx-auto">
          <h1
            className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent 
  bg-gradient-to-r from-green-300 via-emerald-400 to-blue-400 
  drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-gradient-x"
          >
           💸 Wallet Chronicles
          </h1>

          <p className="text-gray-100 drop-shadow-sm leading-relaxed">
            A complete overview of your{" "}
            <span className="text-blue-400 font-semibold">
              financial journey
            </span>{" "}
            — track every
            <span className="text-green-400 font-semibold"> deposit</span>,{" "}
            <span className="text-red-400 font-semibold">withdrawal</span>, and{" "}
            <span className="text-yellow-300 font-semibold">trade</span> with
            precision.
            <br className="hidden sm:block" />
            Know exactly{" "}
            <span className="text-blue-300 font-medium">
              where your money moves
            </span>
            , and how your strategy performs over time.
            <br className="hidden sm:block" />
            Your wallet is more than just a balance — it’s the{" "}
            <span className="italic text-purple-400">heartbeat</span> of your
            trading evolution.
          </p>
        </div>

        {/* Right: Wallet balance & Refresh */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-3xl sm:text-4xl font-bold text-green-400 drop-shadow-md tracking-wide">
            ₹ {balance?.toFixed(2)}
          </div>
          <Button
            onClick={fetchBalance}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl backdrop-blur transition-all duration-200"
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Section 1: Balance & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="w-full flex flex-col items-center justify-center gap-4 p-6 bg-black/30 border border-gray-700/50 rounded-xl backdrop-blur-md shadow-lg">
          <AddMoneyButton />
          <CreateWalletPasswordForm />
        </div>
        <div className="w-full">
          <PaymentForm />
        </div>
      </motion.div>

      {/* Section 2: Withdraw + Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mx-auto mt-10 w-full"
      >
        <div className="w-full">
          <WithdrawForm />
        </div>

        <div className="w-full">
          <WalletTransactionTable />
        </div>
      </motion.div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <WalletProvider>
      <WalletPageContent />
    </WalletProvider>
  );
}
