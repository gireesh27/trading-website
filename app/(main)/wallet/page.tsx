"use client";

import { WalletProvider, useWallet } from "@/contexts/wallet-context";
import { Loader2 } from "lucide-react";
import WalletTransactionTable from "@/components/wallet/WalletTransactionTable";
import CreateWalletPasswordForm from "@/components/wallet/CreateWalletPasswordForm";
import GetSubscriptionCard from "@/components/subscription/GetSubscription";
import AddMoneyButton from "@/components/razorpay/handleAddMoney";
import PaymentForm from "@/components/razorpay/payuAdd";
import WalletBalancePage from "@/components/wallet/WalletBalance";
import { motion } from "framer-motion";
import PayuPayoutForm from "@/components/razorpay/PayuPayoutForm";
import WithdrawForm from "@/components/razorpay/withdrawForm";
import BankTransactions from "@/components/razorpay/BankTransactions";

function WalletPageContent() {
  const { isLoading } = useWallet();

  return (
    <div className="bg-gradient-to-br from-[#0f1117] via-[#111827] to-[#1f2937] text-white min-h-screen">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-12 space-y-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white tracking-tight">
            💼 Wallet
          </h1>
          <p className="text-gray-300 leading-relaxed max-w-3xl">
            A complete overview of your{" "}
            <span className="text-blue-400 font-medium">financial journey</span>{" "}
            — track every
            <span className="text-green-400 font-medium"> deposit</span>,
            <span className="text-red-400 font-medium"> withdrawal</span>, and
            <span className="text-yellow-300 font-medium"> trade</span> with
            precision.
            <br className="hidden sm:block" />
            Know exactly{" "}
            <span className="text-blue-300">where your money moves</span>, and
            how your strategy performs over time.
            <br className="hidden sm:block" />
            Your wallet is more than just a balance — it’s the{" "}
            <span className="italic text-purple-400">heartbeat</span> of your
            trading evolution.
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Section 1: Balance & Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Add Money */}
              <div className="w-full flex flex-col items-center justify-center gap-4 p-6 bg-black/30 border border-gray-700/50 rounded-xl backdrop-blur-md shadow-lg">
                <AddMoneyButton />
                <CreateWalletPasswordForm />
              </div>

              {/* Wallet Balance */}
              <div className="w-full">
                <WalletBalancePage />
              </div>

              {/* Withdraw Card */}
              <div className="w-full">
                <PaymentForm />
              </div>
            </motion.div>

            {/* Section 2: Withdraw + Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Withdraw Form */}
              <div className="w-full">
                <WithdrawForm />
              </div>

              {/* Transactions Table */}
              <div className="w-full">
                <WalletTransactionTable />
              </div>
            </motion.div>

            {/* Section 3: Charts (optional) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {/* <WalletHoldingsChart /> */}
            </motion.div>
          </>
        )}
      </div>
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
