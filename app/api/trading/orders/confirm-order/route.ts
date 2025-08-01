import { connectToDatabase } from "@/lib/Database/mongodb";
import { Order } from "@/lib/Database/Models/Order";
import { Wallet } from "@/lib/Database/Models/Wallet";
import  Transaction  from "@/lib/Database/Models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId, walletPassword } = await req.json();
    const userId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 });
    }

    const order = await Order.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
      userId,
      status: "pending",
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found or already processed" }, { status: 404 });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || !wallet.walletPasswordHash) {
      return NextResponse.json({ message: "Wallet setup incomplete" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(walletPassword, wallet.walletPasswordHash);
    if (!isMatch) {
      return NextResponse.json({ message: "Incorrect wallet password" }, { status: 403 });
    }

    const baseAmount = order.price * order.quantity;
    const fees = (order.feeBreakdown?.brokerage || 0) + (order.feeBreakdown?.convenience || 0);
    const totalAmount = baseAmount + fees;

    if (order.type === "buy" && wallet.balance < totalAmount) {
      return NextResponse.json({ message: "Insufficient wallet balance" }, { status: 400 });
    }

    // Adjust wallet balance
    if (order.type === "buy") {
      wallet.balance -= totalAmount;
    } else {
      wallet.balance += baseAmount; // Refund logic for sell
    }

    await wallet.save();

    // Finalize order
    order.status = "completed";
    order.completedAt = new Date();
    await order.save();

    // Log transaction with fee details
    await Transaction.create({
      userId,
      symbol: order.symbol,
      quantity: order.quantity,
      price: order.price,
      type: order.type, // buy or sell
      status: "success",
      executedAt: new Date(),
      source: "wallet",
      orderId: order._id,
      feeBreakdown: order.feeBreakdown || {},
      totalAmount,
    });

    return NextResponse.json({ message: "Order executed successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("Confirm Order Error:", err);
    return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
  }
}
