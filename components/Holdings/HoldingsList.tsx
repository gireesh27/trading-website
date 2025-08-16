"use client";

import { motion } from "framer-motion";
import { Briefcase, Inbox, IndianRupee, Package, PieChart } from "lucide-react";

interface Holding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export default function HoldingsList({ holdings }: { holdings: Holding[] }) {
  const remainingItems = holdings;

  return (
    <div className="mt-6 w-full max-w-xl mx-auto">
      <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl shadow-black/30 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Briefcase className="w-7 h-7 text-cyan-400" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-200 to-cyan-400 bg-clip-text text-transparent">
            Your Holdings
          </h2>
        </div>

        {/* Holdings Content */}
        {holdings.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-4">
            <Inbox size={40} />
            <p>You have no holdings yet.</p>
            <p className="text-sm">Your purchased stocks will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[26rem] overflow-y-auto pr-2 custom-scrollbar">
            {remainingItems.map((h, i) => (
              <motion.div
                key={h.symbol}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-slate-800/60 rounded-lg p-4 border border-slate-700 hover:border-cyan-400/50 transition-colors duration-300"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg text-slate-100">
                    {h.symbol}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Package size={14} className="text-slate-400" />
                    <span>Qty: {h.quantity.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <IndianRupee size={14} />
                    <div>
                      Avg:{" "}
                      <span className="font-medium text-slate-200">
                        ₹{h.avgPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <PieChart size={14} />
                    <div>
                      Current:{" "}
                      <span className="font-medium text-slate-200">
                        ₹{h.currentPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profit / Loss Section */}
                <div
                  className={`p-3 rounded-md flex justify-between items-center ${
                    h.profitLoss >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                  }`}
                >
                  <span className="font-semibold text-slate-300">P/L</span>
                  <div
                    className={`text-right font-bold ${
                      h.profitLoss >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    <div>
                      {h.profitLoss >= 0 ? "+" : ""}₹{h.profitLoss.toFixed(2)}
                    </div>
                    <div className="text-xs font-medium">
                      ({h.profitLossPercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
