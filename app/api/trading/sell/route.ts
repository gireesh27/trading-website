import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import  Wallet  from "@/lib/Database/Models/Wallet";
import  Transaction  from "@/lib/Database/Models/Transaction";
import  {Order}  from "@/lib/Database/Models/Order"; // if you track orders

export async function POST(req: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { symbol, quantity, price } = await req.json();
  const totalProceeds = quantity * price;
  const userId = session.user.id;

  // Add to wallet
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    return new Response("Wallet not found", { status: 400 });
  }

  wallet.balance += totalProceeds;
  await wallet.save();

  // Log the transaction
  await Transaction.create({
    userId,
    type: "sell",
    symbol,
    amount: totalProceeds,
  });

  // Optionally: store order
  await Order.create({
    userId,
    symbol,
    quantity,
    price,
    type: "sell",
    status: "completed",
  });

  return new Response(JSON.stringify({ success: true }));
}
