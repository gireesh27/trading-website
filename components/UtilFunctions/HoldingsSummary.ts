// utils/portfolioCalculations.ts
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

export function calculatePortfolioStats(holdings: Holding[]) {
  let totalInvested = 0;
  let currentValue = 0;

  holdings.forEach(h => {
    totalInvested += h.avgPrice * h.quantity;
    currentValue += h.currentPrice * h.quantity;
  });

  const profitLossValue = currentValue - totalInvested;
  const profitLossPercent = (profitLossValue / totalInvested) * 100;

  return {
    totalInvested,
    currentValue,
    profitLossValue,
    profitLossPercent,
  };
}
