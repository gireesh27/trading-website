import { NextResponse } from 'next/server';
import type { Order } from '@/types/trading-types'; // Assuming you have a types file for trading

// --- In-memory database simulation ---
// We use a Map to store orders for each user ID.
const userOrders = new Map<string, Order[]>();

// Pre-populate with data for a default test user
userOrders.set('user_123', [
  {
    id: 'order_1',
    symbol: 'NVDA',
    type: 'buy',
    orderType: 'limit',
    quantity: 10,
    price: 450.00,
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'order_2',
    symbol: 'MSFT',
    type: 'sell',
    orderType: 'market',
    quantity: 20,
    status: 'filled',
    price: 330.50,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    filledAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
  },
]);

/**
 * GET handler to fetch orders for the logged-in user.
 */
export async function GET(request: Request) {
  // In a real app, you'd get the user ID from a session or JWT.
  // Here, we simulate it with a header for testing purposes.
  const userId = request.headers.get('x-user-id') || 'user_123';

  const orders = userOrders.get(userId) || [];

  return NextResponse.json({ success: true, data: orders });
}

/**
 * POST handler to create a new order for the logged-in user.
 */
export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id') || 'user_123';

  try {
    const body = await request.json();

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      ...body,
      status: 'pending', // New orders are always pending until filled
      createdAt: new Date().toISOString(),
    };

    // Get the current list of orders for the user, or initialize it if it doesn't exist.
    const currentUserOrders = userOrders.get(userId) || [];
    currentUserOrders.push(newOrder);
    userOrders.set(userId, currentUserOrders);

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });

  } catch (err) {
    console.error('Error creating new order:', err);
    return NextResponse.json({ success: false, error: 'Invalid request payload' }, { status: 400 });
  }
}