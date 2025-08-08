import { getServerSession } from "next-auth";
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";
import { Order } from "@/lib/Database/Models/Order";
import { User } from "@/lib/Database/Models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { orderId, pin } = await req.json();

  await dbConnect();

  const order = await Order.findById(orderId);
  if (!order || order.userId.toString() !== session.user.id) {
    return new Response("Order not found", { status: 404 });
  }

  if (order.status !== "pending") {
    return new Response("Order already completed", { status: 400 });
  }

  const user = await User.findOne({ _id: session.user.id });
  if (!user || !user.walletPasswordHash) {
    return new Response("Wallet not found", { status: 404 });
  }
  const valid = await bcrypt.compare(pin, user.walletPasswordHash);
  if (!valid) {
    return new Response(JSON.stringify({ message: "Invalid PIN" }), { status: 401 });
  }
  const total = order.price * order.quantity;

  if (order.type === "buy") {
    if (user.walletBalance < total) {
      return new Response(JSON.stringify({ message: "Insufficient funds" }), { status: 400 });
    }
    user.walletBalance -= total;
  } else if (order.type === "sell") {
    user.walletBalance += total;
  }
  order.status = "complete";
  await user.save();
  await order.save();
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
