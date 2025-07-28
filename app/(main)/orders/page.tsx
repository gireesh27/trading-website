"use client";

import React from "react";
import { OrdersWidget } from "@/components/Orders/ordersWidget";
import { OrderBook } from "@/components/Orders/order-book";
import { useMarketData } from "@/contexts/enhanced-market-data-context";

const Orders = () => {
  const { selectedSymbol } = useMarketData();

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-4">Order Management</h1>

        {/* Responsive container */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Order Book */}
          <div className="w-full lg:w-1/2">
            <OrderBook symbol={selectedSymbol || "AAPL"} />
          </div>

          {/* Orders Widget */}
          <div className="w-full lg:w-1/2">
            <OrdersWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
