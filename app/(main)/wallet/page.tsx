"use client";

import { WalletProvider, useWallet } from "@/contexts/wallet-context";
import { Loader2 } from "lucide-react";
import WalletTransactionTable from "@/components/wallet/WalletTransactionTable";
import CreateWalletPasswordForm from "@/components/wallet/CreateWalletPasswordForm";
import GetSubscriptionCard from "@/components/subscription/GetSubscription";
import AddMoneyButton from "@/components/razorpay/handleAddMoney";
import WithdrawCard from "@/components/razorpay/withDrawWallet";
import WalletBalancePage from "@/components/wallet/WalletBalance";
import { motion } from "framer-motion";

function WalletPageContent() {
  const { isLoading } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#111827] to-[#1f2937] text-white">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-12 space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold mb-2">Wallet</h1>
          <p className="text-gray-400">
            A complete overview of your financial activity and performance.
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Section 1: Balance, Password, Add Money */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="flex flex-col md:flex-row gap-6 items-center justify-between"
            >
              {/* Add Money Button */}
              <div className="w-full md:flex-1">
                <div className="w-full flex flex-col items-center justify-center gap-4 p-4 bg-black/30 border border-gray-700/50 rounded-xl backdrop-blur-md shadow-md">
                  <AddMoneyButton />
                  <CreateWalletPasswordForm />
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="w-full md:flex-1">
                <WalletBalancePage />
              </div>

              {/* Withdraw Card */}
              <div className="w-full md:flex-1">
                <WithdrawCard />
              </div>
            </motion.div>

            {/* Section 2: Withdraw, Subscription, Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="w-full">
                <GetSubscriptionCard amount={10000000} planName="Pro-Plan" />
              </div>
              <div className="w-full md:col-span-3">
                <WalletTransactionTable />
              </div>
            </motion.div>

            {/* Section 3: Chart / Holdings */}
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
