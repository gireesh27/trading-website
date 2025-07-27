"use client"

import { useAuth } from "@/contexts/auth-context";
import { WalletProvider, useWallet } from "@/contexts/wallet-context";
import { MainNav } from "@/components/main-nav";
import { WalletOverview } from "@/components/wallet/wallet-overview";
import { TransactionsTable } from "@/components/wallet/TransactionTable";
import { WalletCharts } from "@/components/wallet/walletCharts";
import { Loader2 } from "lucide-react";

function WalletPageContent() {
  const { isLoading } = useWallet();
  
  return (
    <div className="min-h-screen bg-[#131722]">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
          <p className="text-gray-400">
            A complete overview of your financial activity and performance.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-8">
            <WalletOverview />
            <WalletCharts />
            <TransactionsTable />
          </div>
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
    )
}