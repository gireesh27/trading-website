interface Holding {
  symbol: string;
  currentPrice: number;
  avgPrice: number;
}

const TopWorstPerformer = ({ holdings }: { holdings: Holding[] }) => {
  const sortedByPerformance = [...holdings].sort((a, b) => {
    const aChange = ((a.currentPrice - a.avgPrice) / a.avgPrice) * 100;
    const bChange = ((b.currentPrice - b.avgPrice) / b.avgPrice) * 100;
    return bChange - aChange;
  });

  const topPerformer = sortedByPerformance[0];
  const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1];

  return (
    <div className="bg-gray-900 p-4 rounded-lg text-white">
      <p className="text-sm text-gray-400">
        Top Performer: <span className="font-bold text-green-400">{topPerformer?.symbol || "-"}</span>
      </p>
      <p className="text-sm text-gray-400 mt-2">
        Worst Performer: <span className="font-bold text-red-400">{worstPerformer?.symbol || "-"}</span>
      </p>
    </div>
  );
};

export default TopWorstPerformer;
