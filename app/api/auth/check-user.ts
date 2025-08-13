import { connectToDatabase } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";
import { NextResponse } from "next/server";

interface CheckUserRequest {
  email: string;
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body: CheckUserRequest = await req.json();

    if (!body.email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: body.email });
    return NextResponse.json({ exists: !!existingUser }, { status: 200 });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Prevent GET requests
export const GET = () => 
  NextResponse.json({ message: "Use POST instead" }, { status: 405 });
