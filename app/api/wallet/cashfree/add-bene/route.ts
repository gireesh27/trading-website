// /app/api/wallet/cashfree/add-bene/route.ts

import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";
import Beneficiary from "@/lib/Database/Models/Beneficiary";
import { generateBeneficiaryId } from "@/lib/utils/bene_id";
const BASE_URL = "https://sandbox.cashfree.com/payout";
const CF_CLIENT_ID = process.env.CASHFREE_CLIENT_ID!;
const CF_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error("Unauthorized access attempt: no session email");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      console.error(`User not found for email: ${session.user.email}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let payload;
    try {
      payload = await req.json();
    } catch (e) {
      console.error("Invalid or empty JSON payload", e);
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const {
      beneficiary_name,
      beneficiary_email,
      beneficiary_phone,
      account,
      ifsc,
      vpa,
      instrument_type = "bankaccount",
      beneficiary_address,
      beneficiary_city,
      beneficiary_state,
      beneficiary_postal_code,
    } = payload;

    if (!beneficiary_name || !beneficiary_email || !beneficiary_phone) {
      console.error("Missing essential beneficiary info", payload);
      return NextResponse.json({ error: "Missing basic beneficiary details" }, { status: 400 });
    }

    const isBank = instrument_type === "bankaccount" && account && ifsc;
    const isUpi = instrument_type === "upi" && vpa;
    if (!isBank && !isUpi) {
      console.error("Invalid instrument type or missing account details", payload);
      return NextResponse.json({ error: "Invalid or missing instrument details" }, { status: 400 });
    }


    const beneficiaryId = generateBeneficiaryId();
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
        beneficiary_address,
        beneficiary_city,
        beneficiary_state,
        beneficiary_postal_code,
      },
      beneficiary_instrument_details: isBank
        ? { bank_account_number: account, bank_ifsc: ifsc }
        : { vpa },
    };

    console.log("Sending payload to Cashfree:", benePayload);
    const response = await fetch(`${BASE_URL}/beneficiary`, {
      method: "POST",
      headers,
      body: JSON.stringify(benePayload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Cashfree backend error:", data);
      return NextResponse.json({ error: "Failed to create beneficiary", details: data }, { status: 500 });
    }

    await Beneficiary.create({
      userId: user._id,
      beneficiary_id: beneficiaryId,
      beneficiary_name,
      beneficiary_email,
      beneficiary_phone,
      bank_account_number: account || "",
      bank_ifsc: ifsc || "",
      vpa: vpa || "",
      beneficiary_address: beneficiary_address || "",
      beneficiary_city: beneficiary_city || "",
      beneficiary_state: beneficiary_state || "",
      beneficiary_postal_code: beneficiary_postal_code || "",
    });

    console.log("Beneficiary saved to DB:", beneficiaryId);
    return NextResponse.json({ success: true, beneficiary_id: beneficiaryId });
  } catch (error) {
    console.error("Unexpected internal server error:", error);
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 });
  }
}
