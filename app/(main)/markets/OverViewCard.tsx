import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatCurrency } from "@/lib/utils/market"; // Assume you have these helpers
import { StockQuote } from "@/types/trading-types";

interface OverviewCardProps {
  quote: StockQuote;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ quote }) => {
  if (!quote) return null;

  const {
    symbol,
    name,
    price,
    change,
    changePercent,
    marketCap,
    high,
    low,
    open,
    previousClose,
    volume,
  } = quote;

  const changeColor = change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted";

  return (
    <Card className="p-4 shadow-md bg-[#131722] text-white" >
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-semibold">{symbol}</CardTitle>
        <p className="text-muted-foreground text-sm">{name}</p>
      </CardHeader>
      <CardContent className="space-y-4 mt-2">
        {/* Price and Change */}
        <div className="flex items-end gap-4">
          <h2 className="text-4xl font-bold">{formatCurrency(price)}</h2>
          <p className={`text-md font-medium ${changeColor}`}>
            {change > 0 ? "+" : ""}
            {formatCurrency(change)} ({changePercent.toFixed(2)}%)
          </p>
        </div>

        {/* Grid Layout for Additional Info */}
        <div className="grid grid-cols-2 gap-y-2 text-sm mt-4">
          {open !== undefined && (
            <div>
              <span className="text-muted-foreground">Open</span>
              <div>{formatCurrency(open)}</div>
            </div>
          )}
          {previousClose !== undefined && (
            <div className="text-right">
              <span className="text-muted-foreground">Prev Close</span>
              <div>{formatCurrency(previousClose)}</div>
            </div>
          )}
          {high !== undefined && (
            <div>
              <span className="text-muted-foreground">24h High</span>
              <div>{formatCurrency(high)}</div>
            </div>
          )}
          {low !== undefined && (
            <div className="text-right">
              <span className="text-muted-foreground">24h Low</span>
              <div>{formatCurrency(low)}</div>
            </div>
          )}
          {volume !== undefined && (
            <div>
              <span className="text-muted-foreground">Volume</span>
              <div>{formatNumber(volume)}</div>
            </div>
          )}
          {marketCap !== undefined && (
            <div className="text-right">
              <span className="text-muted-foreground">Market Cap</span>
              <div>{formatNumber(marketCap)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
