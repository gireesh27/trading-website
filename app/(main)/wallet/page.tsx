"use client";

import { useAuth } from "@/contexts/auth-context";
import { WalletProvider, useWallet } from "@/contexts/wallet-context";
import { MainNav } from "@/components/main-nav";
import { Loader2 } from "lucide-react";
import WalletHoldingsChart from "@/components/wallet/WalletHoldingsChart";
import WalletTransactionTable from "@/components/wallet/WalletTransactionTable";
import CreateWalletPasswordForm from "@/components/wallet/CreateWalletPasswordForm";
import GetSubscriptionCard from "@/components/subscription/GetSubscription";
import AddMoneyButton from "@/components/razorpay/handleAddMoney";
import WithdrawCard from "@/components/razorpay/withDrawWallet";

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
          <div className="space-y-10">
            {/* Row 1: Create Password, Add Money, Withdraw */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="md:col-span-2">
                <CreateWalletPasswordForm />
              </div>
              <div className="md:col-span-1">
                <AddMoneyButton />
              </div>
              <div className="md:col-span-3">
                <WithdrawCard />
              </div>
            </div>

            {/* Row 2: Pro Plan and Transactions */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="md:col-span-2">
                <GetSubscriptionCard amount={10000000} planName="Pro-Plan" />
              </div>
              <div className="md:col-span-4">
                <WalletTransactionTable />
              </div>
            </div>

            {/* Row 3: Holdings Full Width */}
            <div>
              <WalletHoldingsChart />
            </div>
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
  );
}
