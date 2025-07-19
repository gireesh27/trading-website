import { NextResponse } from 'next/server';

export async function GET() {
  const analyticsData = {
    investmentDistribution: [
      { name: 'Technology', value: 45000 },
      { name: 'Automotive', value: 20000 },
      { name: 'Healthcare', value: 10000 },
    ],
    balanceTrend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - 86400000 * (30 - i)).toISOString().split('T')[0],
      balance: 100000 + Math.random() * 25000,
    })),
    dailyPLHistory: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - 86400000 * (7 - i)).toISOString().split('T')[0],
        pnl: (Math.random() - 0.4) * 2000,
    })),
  };
  return NextResponse.json({ success: true, data: analyticsData });
}