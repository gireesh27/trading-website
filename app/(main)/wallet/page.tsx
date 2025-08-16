"use client";

import { useEffect, useState } from "react";
import { WalletProvider, useWallet } from "@/contexts/wallet-context";
import { motion } from "framer-motion";
import Loader from "@/components/loader";
import CreateWalletPasswordForm from "@/components/wallet/CreateWalletPasswordForm";
import WithdrawForm from "@/components/razorpay/withdrawForm";
import WalletTransactionTable from "@/components/wallet/WalletTransactionTable";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import PayuForm from "@/components/payuMoney";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, RefreshCw, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import AddMoney from "@/components/razorpay/handleAddMoney";

function WalletPageContent() {
  const { user, isLoading: authLoading } = useAuth();
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
    if (user) {
      fetchBalance();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto pt-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Compact Wallet Info */}
          <div className="flex flex-col gap-8 lg:w-[40%] flex-shrink-0">
            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-slate-900/60 backdrop-blur-xl border border-cyan-400/20 shadow-2xl shadow-black/40">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-6 h-6 text-cyan-300" />
                    <CardTitle className="text-lg font-semibold text-slate-200">
                      Your Balance
                    </CardTitle>
                  </div>
                  <Button
                    onClick={fetchBalance}
                    size="icon"
                    variant="ghost"
                    className="text-slate-400 h-7 w-7 rounded-full hover:bg-slate-700/50 hover:text-white"
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", loading && "animate-spin")}
                    />
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-10 w-36 bg-slate-800 rounded-md animate-pulse" />
                  ) : (
                    <div className="text-3xl font-bold text-white">
                      ₹
                      {balance?.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full"
            >
              <Tabs defaultValue="add-money" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800/80 rounded-lg p-1 h-10">
                  <TabsTrigger
                    value="add-money"
                    className="data-[state=active]:bg-cyan-600/80 data-[state=active]:text-white rounded-md transition-all text-sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </TabsTrigger>
                  <TabsTrigger
                    value="withdraw"
                    className="data-[state=active]:bg-blue-600/80 data-[state=active]:text-white rounded-md transition-all text-sm"
                  >
                    <Minus className="mr-1 h-4 w-4" /> Withdraw
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="add-money" className="mt-4 w-full">
                  <div className="flex flex-col gap-4 w-full">
                    <div className="w-full">
                      <AddMoney />
                    </div>
                    <div className="w-full">
                      <PayuForm />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="withdraw" className="mt-4 w-full">
                  <WithdrawForm />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Right Column - Expanded Transaction History */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-[60%]"
          >
            <div className=" flex flex-col gap-4 w-full overflow-hidden ">
              <WalletTransactionTable />
              {/* Security Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full items-end flex justify-end"
              >
                <CreateWalletPasswordForm />
              </motion.div>
            </div>
          </motion.div>
        </div>
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
