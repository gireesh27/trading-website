import { NextResponse } from 'next/server';
import type { Transaction } from '@/types/trading-types'; // Make sure this type exists

// In-memory user transaction storage
const userTransactions = new Map<string, Transaction[]>();

// Optional: populate with dummy data for test user
if (!userTransactions.has("user_123")) {
  userTransactions.set("user_123", [
    {
      id: 'txn_1',
      symbol: 'MSFT',
      type: 'sell',
      quantity: 20,
      price: 330.5,
      total: 6610.0,
      fees: 6.61,
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'txn_2',
      symbol: 'TSLA',
      type: 'buy',
      quantity: 100,
      price: 200.0,
      total: 20000.0,
      fees: 20.0,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    },
  ]);
}

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id') || 'user_123';
  const transactions = userTransactions.get(userId) || [];

  return NextResponse.json({ success: true, data: transactions });
}

// Optional: Add POST support to add transactions dynamically
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id') || 'user_123';

  try {
    const body = await request.json();

    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      ...body,
      date: new Date().toISOString(),
    };

    const userTxnList = userTransactions.get(userId) || [];
    userTxnList.push(newTransaction);
    userTransactions.set(userId, userTxnList);

    return NextResponse.json({ success: true, data: newTransaction }, { status: 201 });
  } catch (error) {
    console.error("Failed to add transaction:", error);
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
