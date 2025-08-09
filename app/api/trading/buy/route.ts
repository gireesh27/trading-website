import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Transaction from "@/lib/Database/Models/Transaction";
import { Order } from "@/lib/Database/Models/Order";
import { User } from "@/lib/Database/Models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const userId = session.user.id;

    // Parse and validate inputs
    const { symbol, quantity, price,sector }: { symbol: string; quantity: number; price: number;sector:string } =
      await req.json();

    if (!symbol || quantity <= 0 || price <= 0) {
      return new Response(JSON.stringify({ error: "Invalid buy order data" }), { status: 400 });
    }

    const totalCost = price * quantity;

    // Fetch user and validate wallet balance
    const user = await User.findById(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    if ((user.walletBalance ?? 0) < totalCost) {
      return new Response(JSON.stringify({ error: "Insufficient wallet balance" }), { status: 400 });
    }

    // Deduct from wallet
    user.walletBalance = (user.walletBalance ?? 0) - totalCost;
    await user.save();

    // Log transaction
    await Transaction.create({
      userId,
      symbol,
      sector,
      type: "buy",
      amount: totalCost,
      price,
      quantity,
      status: "completed",
      executedAt: new Date(),
      source: "wallet",
      remarks: "Stock purchased",
      feeBreakdown: {
        brokerage: 0, // Update later with fee logic
        convenience: 0,
      },
    });

    // Log order
    await Order.create({
      userId,
      symbol,
      quantity,
      price,
      type: "buy",
      status: "completed",
      timestamp: new Date(),
    });

    return new Response(JSON.stringify({ success: true, message: "Buy order executed" }), {
      status: 200,
    });
  } catch (error) {
    console.error("[BUY_ORDER_ERROR]", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
