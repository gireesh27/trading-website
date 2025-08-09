import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Holding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  totalInvested: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  previousClose?: number; // Make optional as it might not always be present
  sector?: string; // Make optional as it might not always be present
}
const HoldingsSummary = ({ holdings }: { holdings: Holding[] }) => {
  // Day Change
  const dayChange = holdings.reduce((total, h) => {
    const changePerStock = (h.currentPrice - (h.previousClose || h.avgPrice)) * h.quantity;
    return total + changePerStock;
  }, 0);

  // Top/Worst
  const sortedByPerformance = [...holdings].sort((a, b) => {
    const aChange = ((a.currentPrice - a.avgPrice) / a.avgPrice) * 100;
    const bChange = ((b.currentPrice - b.avgPrice) / b.avgPrice) * 100;
    return bChange - aChange;
  });
  const topPerformer = sortedByPerformance[0];
  const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1];

  // Sector Allocation
  const sectorAllocation = holdings.reduce((acc: { [key: string]: number; }, h) => {
    const sector = h.sector || "ShareMarket";
    const value = h.currentPrice * h.quantity;
    acc[sector] = (acc[sector] || 0) + value;
    return acc;
  }, {});
  const sectorData = Object.entries(sectorAllocation).map(([sector, value]) => ({
    name: sector,
    value
  }));

  const COLORS = ["#4ade80", "#60a5fa", "#fbbf24", "#f87171", "#a78bfa"];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Day Change */}
      <div className="bg-gray-900 p-4 rounded-lg text-center">
        <h2 className="text-gray-400">Day Change</h2>
        <p className={`text-2xl font-bold ${dayChange >= 0 ? "text-green-400" : "text-red-400"}`}>
          {dayChange.toFixed(2)}
        </p>
      </div>

      {/* Top/Worst Performer */}
      <div className="bg-gray-900 p-4 rounded-lg">
        <h2 className="text-gray-400 mb-2">Performance</h2>
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Top Performer</p>
            <p className="font-bold text-green-400">{topPerformer?.symbol}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Worst Performer</p>
            <p className="font-bold text-red-400">{worstPerformer?.symbol}</p>
          </div>
        </div>
      </div>

      {/* Sector Allocation */}
      <div className="bg-gray-900 p-4 rounded-lg">
        <h2 className="text-gray-400 mb-2">Sector Allocation</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={sectorData} dataKey="value" nameKey="name" outerRadius={80}>
              {sectorData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default HoldingsSummary;
