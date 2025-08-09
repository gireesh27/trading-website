import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePortfolioStats } from "../UtilFunctions/HoldingsSummary";

interface Holding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  totalInvested: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export default function PortfolioSummary({ holdings }: { holdings: Holding[] }) {
  const { totalInvested, currentValue, profitLossValue, profitLossPercent } =
    calculatePortfolioStats(holdings);

  const profitColor = profitLossValue >= 0 ? "text-green-500" : "text-red-500";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Total Portfolio Value */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg">💰 Total Portfolio Value</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-white">
            ₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      {/* Invested vs Current */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg">📊 Invested vs Current</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            Invested: ₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-400">
            Current: ₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
          <p className={`text-xl font-bold ${profitColor}`}>
            {profitLossValue >= 0 ? "+" : ""}
            ₹{profitLossValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })} (
            {profitLossPercent.toFixed(2)}%)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
