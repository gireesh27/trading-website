// /app/api/wallet/cashfree/create-beneficiary/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { userId, name, phone, email, bankAccount, ifsc } = await req.json();

  if (!userId || !bankAccount || !ifsc) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const headers = {
    accept: "application/json",
    "x-client-id": process.env.CASHFREE_CLIENT_ID!,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
    "x-api-version": "2022-01-01",
    "content-type": "application/json"
  };

  const beneficiaryId = `benef_${userId}`;

  const data = {
    beneId: beneficiaryId,
    name,
    email,
    phone,
    bankAccount,
    ifsc,
    address1: "NA"
  };

  try {
    const res = await axios.post("https://payout-api.cashfree.com/payout/v2/addBeneficiary", data, { headers });
    return NextResponse.json({ success: true, beneficiaryId });
  } catch (error: any) {
    return NextResponse.json({ error: error.response?.data || "Error adding beneficiary" }, { status: 500 });
  }
}
