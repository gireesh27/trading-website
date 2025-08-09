import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/Database/mongodb';
import { User } from '@/lib/Database/Models/User';
import { Order } from '@/lib/Database/Models/Order';
import Transaction from '@/lib/Database/Models/Transaction';
import { updateHoldings } from '@/lib/Database/updateHoldings';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { password, orderId } = await req.json();
  if (!password || !orderId) {
    return NextResponse.json({ error: 'Password and orderId required' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user || !user.walletPasswordHash) {
      return NextResponse.json({ error: 'Wallet password not set' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.walletPasswordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
    }

    const order = await Order.findOne({ _id: orderId, userId: user._id, status: 'pending' });
    if (!order) {
      return NextResponse.json({ error: 'Order not found or already completed' }, { status: 404 });
    }

    const walletBalance = user.walletBalance ?? 0;
    const totalCost = order.price * order.quantity;

    // BUY: Deduct wallet balance, update holdings
    if (order.type === 'buy') {
      if (walletBalance < totalCost) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }
      user.walletBalance -= totalCost;
      await updateHoldings(user._id, order.symbol, order.quantity, order.price, order.sector);
    }

    // SELL: Add wallet balance, update holdings with negative quantity
    else if (order.type === 'sell') {
      user.walletBalance += totalCost;
      await updateHoldings(user._id, order.symbol, -order.quantity, order.price,order.sector);
    }

    await user.save();

    // Update order status to completed
    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();

    // Create transaction log
    await Transaction.create({
      userId: user._id,
      type: order.type === 'buy' ? 'debit' : 'credit',
      symbol: order.symbol,
      amount: totalCost,
      description: `Order executed for ${order.symbol}`,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, message: 'Order confirmed and completed' });
  } catch (err) {
    console.error('Error confirming order:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
