interface Holding {
  currentPrice: number;
  previousClose?: number;
  avgPrice: number;
  quantity: number;
}

const DayChange = ({ holdings }: { holdings: Holding[] }) => {
  const dayChange = holdings.reduce((total, h) => {
    const changePerStock =
      (h.currentPrice - (h.previousClose || h.avgPrice)) * h.quantity;
    return total + changePerStock;
  }, 0);

  return (
<div className="bg-gray-900 p-4 rounded-lg text-center">
  <h2 className="text-gray-400 mb-1 text-sm">Day Change</h2>
  <p className={`text-sm font-bold ${dayChange >= 0 ? "text-green-400" : "text-red-400"}`}>
    {dayChange.toFixed(2)}
  </p>
</div>

  );
};

export default DayChange;
