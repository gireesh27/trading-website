"use client";

import { motion } from "framer-motion";

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

export default function HoldingsList({
  holdings,
}: {
  holdings: Holding[];
}) {
  const remainingItems = holdings;

  return (
    <div className="mt-6 space-y-3 w-full max-w-xl mx-auto text-white">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
        Your Holdings
      </h2>

      {holdings.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No holdings found
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Scrollable remaining holdings */}
          {remainingItems.length > 0 && (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 smooth-scroll">
              {remainingItems.map((h, i) => (
                <motion.div
                  key={h.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex justify-between items-center p-3 bg-gray-800 rounded-md hover:bg-gray-700 transition cursor-pointer"
                >
                  <div className="font-bold text-white">{h.symbol}</div>
                  <div className="text-sm text-gray-300 text-right">
                    <div>Qty: {h.quantity.toFixed(2)}</div>
                    <div>
                      Avg: ₹{h.avgPrice.toFixed(2)} | Current: ₹{h.currentPrice.toFixed(2)}
                    </div>
                    <div>
                      P/L:{" "}
                      <span className={h.profitLoss >= 0 ? "text-green-400" : "text-red-400"}>
                        ₹{h.profitLoss.toFixed(2)} ({h.profitLossPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
