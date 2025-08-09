import { connectToDatabase } from "@/lib/Database/mongodb";
import { Order } from "@/lib/Database/Models/Order";
import Transaction from "@/lib/Database/Models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { User } from "@/lib/Database/Models/User";
export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId, walletPassword,sector } = await req.json();
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

    const user = await User.findById(userId);
    if (!user || !user.walletPasswordHash) {
      return NextResponse.json({ message: "Wallet setup incomplete" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(walletPassword, user.walletPasswordHash);
    if (!isMatch) {
      return NextResponse.json({ message: "Incorrect wallet password" }, { status: 403 });
    }

    const baseAmount = order.price * order.quantity;
    const fees = (order.feeBreakdown?.brokerage || 0) + (order.feeBreakdown?.convenience || 0);
    const totalAmount = baseAmount + fees;

    if (order.type === "buy" && user.walletBalance < totalAmount) {
      return NextResponse.json({ message: "Insufficient wallet balance" }, { status: 400 });
    }


    // Finalize order
    order.status = "completed";
    order.completedAt = new Date();
    await order.save();

    // Log transaction
    await Transaction.create({
      userId,
      sector,
      symbol: order.symbol,
      quantity: order.quantity,
      price: order.price,
      type: order.type,
      status: "success",
      executedAt: new Date(),
      source: "wallet",
      orderId: order._id,
      feeBreakdown: order.feeBreakdown || {},
      totalAmount,
    });

    // Adjust wallet & update holdings
    if (order.type === "buy") {
      user.walletBalance -= totalAmount;
    } else {
      user.walletBalance += baseAmount;
    }
    await user.save();


    return NextResponse.json({ message: "Order executed successfully" }, { status: 200 });

  } catch (err: any) {
    console.error("Confirm Order Error:", err);
    return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
  }
}
