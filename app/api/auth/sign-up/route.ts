// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    const newUser = new User({
      name,
      email,
      emailPasswordHash: password,
      isOAuth: false,
      isVerified: true,
      walletBalance: 1000, // initial wallet balance
    });

    await newUser.save();

    return NextResponse.json(
      { success: true, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
