import { NextResponse } from 'next/server';
import type { Portfolio } from '@/types/trading-types'; // Ensure this is defined properly

// In-memory portfolio store keyed by user ID
const userPortfolios = new Map<string, Portfolio>();

// Optional: seed test data for a test user
if (!userPortfolios.has('user_123')) {
  userPortfolios.set('user_123', {
    totalValue: 125500.75,
    totalGainLoss: 25500.75,
    totalGainLossPercent: 25.50,
    availableCash: 50200.25,
    positions: [
      {
        id: 'pos_aapl',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 50,
        avgPrice: 150.00,
        currentPrice: 175.25,
        totalValue: 8762.50,
        gainLoss: 1262.50,
        gainLossPercent: 16.83,
        type: 'long',
        openDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      },
      {
        id: 'pos_tsla',
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        quantity: 100,
        avgPrice: 200.00,
        currentPrice: 245.50,
        totalValue: 24550,
        gainLoss: 4550,
        gainLossPercent: 22.75,
        type: 'long',
        openDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
      },
    ],
    dayChange: 1200.30,
    dayChangePercent: 1.05,
  });
}

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id') || 'user_123';

  const portfolio = userPortfolios.get(userId) || {
    totalValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    availableCash: 100000, // Default cash
    positions: [],
    dayChange: 0,
    dayChangePercent: 0,
  };

  return NextResponse.json({ success: true, data: portfolio });
}

// Optional: POST or PUT to update user's portfolio
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id') || 'user_123';
  try {
    const body = await request.json();

    userPortfolios.set(userId, body);
    return NextResponse.json({ success: true, data: body }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid portfolio format' }, { status: 400 });
  }
}
