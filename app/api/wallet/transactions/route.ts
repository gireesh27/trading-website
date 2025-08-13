import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import Transaction from "@/lib/Database/Models/Transaction";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
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

    // Use email to fetch transactions if userId not in session
    const filters: any = { userEmail: session.user.email }; // Use userEmail instead of ObjectId

    if (type && type !== "all") filters.type = type;
    if (symbol) filters.symbol = symbol;

    if (from || to) {
      filters.date = {};
      if (from && !isNaN(Date.parse(from))) filters.date.$gte = new Date(from);
      if (to && !isNaN(Date.parse(to))) filters.date.$lte = new Date(to);
    }

    const transactions = await Transaction.find(filters).sort({ date: -1 });

    return new Response(JSON.stringify({ success: true, transactions }), { status: 200 });
  } catch (err: any) {
    console.error("GET /wallet/transactions error:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
