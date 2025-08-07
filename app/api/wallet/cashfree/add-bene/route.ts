// /app/api/wallet/cashfree/add-bene/route.ts

import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";
import Beneficiary from "@/lib/Database/Models/Beneficiary";
const BASE_URL = "https://sandbox.cashfree.com/payout";
const CF_CLIENT_ID = process.env.CASHFREE_CLIENT_ID!;
const CF_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET!;

export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const {
    beneficiary_name,
    beneficiary_email,
    beneficiary_phone,
    account,
    ifsc,
    vpa,
    instrument_type = "bankaccount",
  } = await req.json();

  if (!beneficiary_name || (!account && !vpa)) {
    return NextResponse.json({ error: "Missing required beneficiary details" }, { status: 400 });
  }

  const beneficiaryId = `${user._id}-${Date.now()}`;

  const headers = {
    "Content-Type": "application/json",
    "x-client-id": CF_CLIENT_ID,
    "x-client-secret": CF_CLIENT_SECRET,
    "x-api-version": "2024-01-01",
  };

  const benePayload: any = {
    beneficiary_id: beneficiaryId,
    beneficiary_name,
    beneficiary_contact_details: {
      beneficiary_email,
      beneficiary_phone,
      beneficiary_country_code: "+91",
    },
    beneficiary_instrument_details: {},
  };

  if (instrument_type === "bankaccount" && account && ifsc) {
    benePayload.beneficiary_instrument_details.bank_account_number = account;
    benePayload.beneficiary_instrument_details.bank_ifsc = ifsc;
  } else if (instrument_type === "upi" && vpa) {
    benePayload.beneficiary_instrument_details.vpa = vpa;
  } else {
    return NextResponse.json({ error: "Invalid instrument details" }, { status: 400 });
  }

  const beneRes = await fetch(`${BASE_URL}/beneficiary`, {
    method: "POST",
    headers,
    body: JSON.stringify(benePayload),
  });

  const beneData = await beneRes.json();
  if (beneRes.ok) {
    await Beneficiary.create({
      userId: user._id,
      beneficiary_id: beneficiaryId,
      bank_account_number: account || "",
      bank_ifsc: ifsc || "",
      beneficiary_name,
      beneficiary_email,
      beneficiary_phone,
    });

    return NextResponse.json({
      success: true,
      beneficiary_id: beneficiaryId,
      message: "Beneficiary created and saved",
    });
  }
  else {
    if (!beneRes.ok) {
      return NextResponse.json({
        error: "Beneficiary creation failed",
        details: beneData,
      }, { status: 500 });
    }
  }
  return NextResponse.json({
    success: true,
    beneficiary_id: beneficiaryId,
    message: "Beneficiary created successfully",
  });
}
