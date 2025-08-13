// /api/auth/login.ts
import { connectToDatabase } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectToDatabase();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email and password are required." },
      { status: 400 }
    );
  }

  const user = await User.findOne({ email });

  if (!user || !user.emailPasswordHash) {
    return NextResponse.json(
      { success: false, message: "User not found. Please sign up first." },
      { status: 404 }
    );
  }

  // Compare password with hashed emailPasswordHash
  const isValid = await bcrypt.compare(password, user.emailPasswordHash);
  if (!isValid) {
    return NextResponse.json(
      { success: false, message: "Invalid credentials." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      walletBalance: user.walletBalance,
    },
  });
}
