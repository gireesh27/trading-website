import { NextResponse } from 'next/server';

// This simulates fetching real-time wallet overview data from a database.
export async function GET() {
  const overviewData = {
    currentBalance: 125500.75,
    totalDeposits: 150000.00,
    totalWithdrawals: 50000.00,
    totalInvested: 75300.50,
    availableCash: 50200.25,
    dailyPL: { amount: 1200.30, percent: 1.05 },
    weeklyPL: { amount: -550.80, percent: -0.45 },
    allTimePL: { amount: 25500.75, percent: 25.50 },
  };
  return NextResponse.json({ success: true, data: overviewData });
}