import { NextResponse } from "next/server";
import{ connectToDatabase as connectDB }from "@/lib/Database/mongodb";
import {Wallet} from "@/lib/Database/Models/Wallet";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, pin } = await req.json();
  await connectDB();

  const wallet = await Wallet.findOne({ userId: session.user.email });
  if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

  const validPin = await bcrypt.compare(pin, wallet.pin);
  if (!validPin) return NextResponse.json({ error: "Invalid PIN" }, { status: 403 });

  if (wallet.balance < amount) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

  // For RazorpayX integration, send payout here

  wallet.balance -= amount;
  await wallet.save();

  return NextResponse.json({ success: true, balance: wallet.balance });
}
