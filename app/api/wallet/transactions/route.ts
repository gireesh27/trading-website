import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import Transaction from "@/lib/Database/Models/Transaction";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const symbol = searchParams.get("symbol");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Filter by ObjectId
    const filters: any = { userId: new mongoose.Types.ObjectId(session.user.id) };

    if (type && type !== "all") filters.type = type;
    if (symbol) filters.symbol = symbol;

    if (from || to) {
      filters.createdAt = {};
      if (from && !isNaN(Date.parse(from))) filters.createdAt.$gte = new Date(from);
      if (to && !isNaN(Date.parse(to))) filters.createdAt.$lte = new Date(to);
    }

    const transactions = await Transaction.find(filters).sort({ createdAt: -1 });

    return new Response(JSON.stringify({ success: true, transactions }), { status: 200 });
  } catch (err: any) {
    console.error("GET /wallet/transactions error:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
