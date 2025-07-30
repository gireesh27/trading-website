"use client";

import React, { useEffect, useState } from "react";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StockMetricsDisplayProps {
  symbol: string;
}

const formatLabel = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

const formatValue = (value: any) =>
  value === null || value === undefined
    ? "N/A"
    : typeof value === "number"
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : value;

const ITEMS_PER_BATCH = 10;

const StockMetricsDisplay: React.FC<StockMetricsDisplayProps> = ({
  symbol,
}) => {
  const [metrics, setMetrics] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);

  const { getStockMetrics } = useMarketData();

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!symbol) return;
      setError(null);
      setLoading(true);
      try {
        const data = await getStockMetrics(symbol.toUpperCase());
        setMetrics(data);
        setVisibleCount(ITEMS_PER_BATCH);
      } catch (err: any) {
        setError(`Failed to load metrics: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [symbol]);

  const allMetrics = metrics ? Object.entries(metrics) : [];
  const visibleMetrics = allMetrics.slice(0, visibleCount);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">
        Metrics for <span className="text-white">{symbol.toUpperCase()}</span>
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-medium mb-4">{error}</div>
      ) : metrics ? (
        <Card className="bg-gray-900 text-white border border-gray-700 shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="text-xl text-blue-300">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {visibleMetrics.map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between items-center text-lg font-medium text-gray-200 border-b border-gray-700 pb-1"
              >
                <span className="text-left text-white">{formatLabel(key)}</span>
                <span className="text-right text-blue-400">
                  {formatValue(value)}
                </span>
              </div>
            ))}

            {visibleCount < allMetrics.length && (
              <div className="pt-6 text-center">
                <Button
                  variant="ghost"
                  className="bg-gradient-to-br from-blue-500 to-purple-600 text-white py-2 px-5 rounded-xl hover:opacity-90 transition shadow-md text-sm font-semibold"
                  onClick={() =>
                    setVisibleCount((prev) =>
                      Math.min(prev + ITEMS_PER_BATCH, allMetrics.length)
                    )
                  }
                >
                  Show More
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-muted-foreground mt-8">
          No metrics available for <strong>{symbol}</strong>.
        </div>
      )}
    </div>
  );
};

export default StockMetricsDisplay;
