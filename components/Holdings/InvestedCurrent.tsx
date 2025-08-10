import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  totalInvested: number;
  currentValue: number;
  profitLossValue: number;
  profitLossPercent: number;
}

const InvestedVsCurrent = ({
  totalInvested,
  currentValue,
  profitLossValue,
  profitLossPercent,
}: Props) => {
  const profitColor = profitLossValue >= 0 ? "text-green-400" : "text-red-400";

  return (
    <div className="bg-gray-900 rounded-lg text-left p-4 text-gray-400">
      <p className="text-sm">
        Invested:{" "}
        <span className="font-semibold text-white">
          ₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </span>
      </p>
      <p className="text-sm mt-1">
        Current:{" "}
        <span className="font-semibold text-white">
          ₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </span>
      </p>
      {/* <p className={`text-lg font-bold mt-2 ${profitColor}`}>
        {profitLossValue >= 0 ? "+" : ""}₹
        {profitLossValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}{" "}
        ({profitLossPercent.toFixed(2)}%)
      </p> */}
    </div>
  );
};

export default InvestedVsCurrent;
