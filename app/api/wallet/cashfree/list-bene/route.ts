import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";
import Beneficiary from "@/lib/Database/Models/Beneficiary";
import { User } from "@/lib/Database/Models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const beneficiaries = await Beneficiary.find({ userId: user._id }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: beneficiaries.length,
      beneficiaries,
    });
  } catch (error) {
    console.error("Error listing beneficiaries:", error);
    return NextResponse.json(
      { error: "Failed to fetch beneficiaries" },
      { status: 500 }
    );
  }
}
