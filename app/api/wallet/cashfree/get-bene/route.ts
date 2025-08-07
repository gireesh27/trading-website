import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/Database/mongodb";

const BASE_URL = "https://sandbox.cashfree.com/payout";
const CLIENT_ID = process.env.CASHFREE_CLIENT_ID!;
const CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET!;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const beneficiaryId = req.nextUrl.searchParams.get("beneficiary_id");

  if (!beneficiaryId) {
    return NextResponse.json(
      { error: "Missing beneficiary_id" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${BASE_URL}/beneficiary?beneficiary_id=${beneficiaryId}`, {
      method: "GET",
      headers: {
        "X-Client-Id": CLIENT_ID,
        "X-Client-Secret": CLIENT_SECRET,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
