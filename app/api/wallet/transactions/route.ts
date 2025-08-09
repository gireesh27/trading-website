import { connectToDatabase as connectDB } from "@/lib/Database/mongodb";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import Transaction from "@/lib/Database/Models/Transaction";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await connectDB();

  const res = new Response();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const symbol = searchParams.get("symbol");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filters: any = { userId: new mongoose.Types.ObjectId(session.user.id) };
  if (type && type !== "all") filters.type = type;
  if (symbol) filters.symbol = symbol;
  if (from || to) {
    filters.date = {};
    if (from) filters.date.$gte = new Date(from);
    if (to) filters.date.$lte = new Date(to);
  }

  const transactions = await Transaction.find(filters).sort({ date: -1 });

  return new Response(JSON.stringify({ success: true, transactions }), { status: 200 });
}
