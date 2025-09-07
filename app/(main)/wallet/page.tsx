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
import PayuForm from "@/components/wallet/payuform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, RefreshCw, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import AddMoney from "@/components/wallet/AddMoney";
import TestCards from "@/components/wallet/TestCards";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { TextGenerateSameColour } from "@/components/ui/TextGenerateSameColour";

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
    if (user?.id) {
      fetchBalance();
    }
  }, [user?.id]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8">
      <BackgroundBeamsWithCollision className=" fixed inset-0 z-0  pointer-events-none bg-gradient-to-br from-[#1a1c2b]/90 via-[#2a2c3d]/70 to-[#1a1c2b]/90">
        <div className=" bg-purple-500  " />
        <div className=" bg-blue-500  " />
        <div className=" bg-pink-500 " />
        <div className=" bg-red-500  " />
        <div className=" bg-yellow-500  " />
      </BackgroundBeamsWithCollision>
      {/* Heading */}
      <motion.header
        className="flex flex-col items-start justify-center  space-y-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h1
          className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent 
               bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 
               animate-gradient-x drop-shadow-lg"
        >
          Your Transactions
        </motion.h1>
        <div className="flex flex-wrap justify-center gap-1 font-semibold text-center">
          <TextGenerateSameColour words="Monitor and manage all your wallet transactions seamlessly with real-time updates and secure operations." />
        </div>
      </motion.header>
      <div className=" mx-auto ">
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
                    <CardTitle
                      className="text-2xl font-bold tracking-wide bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 
             bg-clip-text text-transparent animate-gradient drop-shadow-lg 
             hover:drop-shadow-xl transition-all duration-300 ease-in-out"
                    >
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
                    <div
                      className="text-3xl font-bold  bg-gradient-to-r from-green-400 via-green-900 to-cyan-200 
             bg-clip-text text-transparent animate-gradient drop-shadow-lg 
             hover:drop-shadow-xl transition-all duration-300 ease-in-out "
                    >
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
                    className="data-[state=active]:bg-cyan-600/80 data-[state=active]:text-white rounded-md transition-all text-sm"
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
            {!user?.walletPasswordHash && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-full"
              >
                <CreateWalletPasswordForm />
              </motion.div>
            )}
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
                <TestCards />
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
