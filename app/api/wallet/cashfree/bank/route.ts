// /app/api/wallet/cashfree/bank/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/Database/mongodb";
import  Transaction  from "@/lib/Database/Models/Transaction";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const transactions = await Transaction.find({
    userEmail: session.user.email,
    source: "bank",
  }).sort({ createdAt: -1 });

  return NextResponse.json(transactions);
}
