import { NextResponse } from 'next/server';

// Mock wallet data - in a real app, this would come from a database
const mockWallet = {
  balance: 75200.50,
  lockedBalance: 15000.00,
  totalInvested: 50000.00,
  totalReturns: 25200.50,
};

export async function GET() {
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return NextResponse.json({ success: true, data: mockWallet });
}