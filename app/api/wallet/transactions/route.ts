import { NextResponse } from 'next/server';
import type { Transaction } from '@/types/wallet-types';

const allTransactions: Transaction[] = [
    // Add more transactions to simulate a larger dataset
    { id: '1', date: new Date().toISOString(), type: 'Deposit', amount: 50000, status: 'Success' },
    { id: '2', date: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'Buy', symbol: 'AAPL', quantity: 10, price: 175, amount: -1750, status: 'Success' },
    { id: '3', date: new Date(Date.now() - 86400000 * 3).toISOString(), type: 'Sell', symbol: 'TSLA', quantity: 5, price: 250, amount: 1250, status: 'Success' },
    { id: '4', date: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'Withdraw', amount: -10000, status: 'Pending' },
    { id: '5', date: new Date(Date.now() - 86400000 * 7).toISOString(), type: 'Dividend', symbol: 'MSFT', amount: 50.75, status: 'Success' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // In a real app, you would use these filters in your database query
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const type = searchParams.get('type');
  const symbol = searchParams.get('symbol');

  // Simulate filtering
  let filteredTransactions = allTransactions;
  // ... add filtering logic here based on params

  return NextResponse.json({ success: true, data: filteredTransactions });
}