// /app/api/wallet/cashfree/transfer-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { transferId } = await req.json();

  if (!transferId) {
    return NextResponse.json({ error: "Missing transferId" }, { status: 400 });
  }

  const headers = {
    accept: "application/json",
    "x-client-id": process.env.CASHFREE_CLIENT_ID!,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
    "x-api-version": "2022-01-01"
  };

  try {
    const res = await axios.get(
      `https://payout-api.cashfree.com/payout/v2/getTransferStatus?transferId=${transferId}`,
      { headers }
    );
    return NextResponse.json(res.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.response?.data || "Failed to fetch status" }, { status: 500 });
  }
}
