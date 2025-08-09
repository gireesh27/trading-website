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

    // Extract and validate request data
    const { symbol, quantity, price,sector }: { symbol: string; quantity: number; price: number,sector:string } =
      await req.json();

    if (!symbol || quantity <= 0 || price <= 0) {
      return new Response(JSON.stringify({ error: "Invalid sell order data" }), { status: 400 });
    }

    const totalProceeds = price * quantity;

    // Fetch user and ensure valid wallet
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Ensure wallet balance is defined
    if (typeof user.walletBalance !== "number") {
      user.walletBalance = 0;
    }

    // Update wallet balance
    user.walletBalance += totalProceeds;
    await user.save();

    // Create transaction
    await Transaction.create({
      userId,
      symbol,
      sector,
      type: "sell",
      amount: totalProceeds,
      price,
      quantity,
      status: "completed",
      executedAt: new Date(),
      source: "wallet",
      remarks: "Stock sold",
      feeBreakdown: {
        brokerage: 0,        // Update if fee logic is available
        convenience: 0,
      },
    });

    // Create order
    await Order.create({
      userId,
      symbol,
      quantity,
      price,
      type: "sell",
      status: "completed",
      timestamp: new Date(),
    });

    return new Response(JSON.stringify({ success: true, message: "Sell order executed" }), {
      status: 200,
    });
  } catch (error) {
    console.error("[SELL_ORDER_ERROR]", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
