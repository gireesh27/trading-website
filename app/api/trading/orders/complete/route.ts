import { getServerSession } from "next-auth";
import {connectToDatabase as dbConnect }from "@/lib/Database/mongodb";
import {Order} from "@/lib/Database/Models/Order";
import Wallet from "@/lib/Database/Models/Wallet";
import bcrypt from "bcryptjs";

export async function POST(req: { json: () => PromiseLike<{ orderId: any; pin: any; }> | { orderId: any; pin: any; }; }) {
  const session = await getServerSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { orderId, pin } = await req.json();

  await dbConnect();

  const order = await Order.findById(orderId);
  if (!order || order.userId !== session.user.id) {
    return new Response("Order not found", { status: 404 });
  }

  if (order.status !== "pending") {
    return new Response("Order already completed", { status: 400 });
  }

  const wallet = await Wallet.findOne({ userId: session.user.id });
  if (!wallet || !wallet.passwordHash) {
    return new Response("Wallet not found", { status: 404 });
  }

  const valid = await bcrypt.compare(pin, wallet.passwordHash);
  if (!valid) {
    return new Response(JSON.stringify({ message: "Invalid PIN" }), { status: 401 });
  }

  const total = order.price * order.quantity;

  if (order.type === "buy") {
    if (wallet.balance < total) {
      return new Response(JSON.stringify({ message: "Insufficient funds" }), { status: 400 });
    }

    wallet.balance -= total;
  } else if (order.type === "sell") {
    wallet.balance += total;
  }

  order.status = "complete";

  await wallet.save();
  await order.save();

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
