import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  currentValue: number;
}

const TotalPortfolioValue = ({ currentValue }: Props) => {
  return (
<div className="bg-gray-900 rounded-lg text-left p-4">
  <h2 className="text-gray-400 mb-1 text-sm">Total Portfolio Value</h2>
  <p className="text-lg font-bold text-white text-end">
    ₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
  </p>
</div>

  );
};

export default TotalPortfolioValue;
