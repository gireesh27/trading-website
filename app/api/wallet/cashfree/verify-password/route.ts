// /api/wallet/verify-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email }).select("+wallet.password");

  const isValid = await bcrypt.compare(password, user.wallet.password);
  return NextResponse.json({ valid: isValid });
}
