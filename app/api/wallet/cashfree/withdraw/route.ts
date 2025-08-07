// /app/api/wallet/withdraw/route.ts

import { NextRequest, NextResponse } from "next/server";
import { User } from "@/lib/Database/Models/User";
import Transaction from "@/lib/Database/Models/Transaction";
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

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
    beneficiary_email,
    beneficiary_phone,
    beneficiary_name,
    ifsc,
    account,
    beneficiary_address,
    beneficiary_state,
    beneficiary_city,
    card_token,
    card_network_type,
    vpa,
    beneficiary_postal_code,
    transfer_amount,
    instrument_type = "bankaccount",
  } = await req.json();

  if (!transfer_amount || transfer_amount <= 0) {
    return NextResponse.json({ error: "Invalid transfer amount" }, { status: 400 });
  }

  const beneficiaryId = `${user._id}-${Date.now()}`;
  const transferId = `WD-${Date.now()}`;

  const headers = {
    "Content-Type": "application/json",
    "x-client-id": CF_CLIENT_ID,
    "x-client-secret": CF_CLIENT_SECRET,
    "x-api-version": "2024-01-01",
  };

  let existingBeneficiaryId: string | null = null;

  if (instrument_type === "bankaccount" && account && ifsc) {
    const lookupUrl = new URL(`${BASE_URL}/beneficiary`);
    lookupUrl.searchParams.set("bank_account_number", account);
    lookupUrl.searchParams.set("bank_ifsc", ifsc);

    const lookupRes = await fetch(lookupUrl.toString(), { method: "GET", headers });
    const lookupData = await lookupRes.json();

    if (
      lookupRes.ok &&
      lookupData?.status === "SUCCESS" &&
      lookupData?.data?.beneficiary_id
    ) {
      existingBeneficiaryId = lookupData.data.beneficiary_id;
    } else {
      // Create beneficiary by calling internal add-bene API
      const createBeneRes = await fetch(`${process.env.NEXTAUTH_URL}/api/wallet/cashfree/add-bene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beneficiary_name,
          beneficiary_email,
          beneficiary_phone,
          account,
          ifsc,
          vpa,
          instrument_type,
        }),
      });
      const createBeneData = await createBeneRes.json();

      if (!createBeneRes.ok) {
        return NextResponse.json({ error: "Failed to create beneficiary", details: createBeneData }, { status: 500 });
      }

      existingBeneficiaryId = createBeneData.beneficiary_id;
    }
  }

  const transferPayload = {
    transfer_id: transferId,
    transfer_amount,
    transfer_currency: "INR",
    transfer_remarks: "withdrawal",
    transfer_mode: instrument_type,
    beneficiary_details: {
      beneficiary_id: existingBeneficiaryId,
      beneficiary_name,
      beneficiary_contact_details: {
        beneficiary_postal_code,
        beneficiary_phone,
        beneficiary_email,
        beneficiary_country_code: "+91",
        beneficiary_address,
        beneficiary_city,
        beneficiary_state,
      },
      beneficiary_instrument_details: {
        ...(instrument_type === "upi"
          ? { vpa }
          : {
              bank_account_number: account,
              bank_ifsc: ifsc,
            }),
        card_details: {
          card_network_type,
          card_token,
        },
      },
    },
  };

  const transferRes = await fetch(`${BASE_URL}/transfers`, {
    method: "POST",
    headers,
    body: JSON.stringify(transferPayload),
  });

  const transferResult = await transferRes.json();

  if (!transferRes.ok) {
    return NextResponse.json({ error: "Transfer failed", details: transferResult }, { status: 500 });
  }

  user.walletBalance -= transfer_amount;
  await user.save();

  await Transaction.create({
    userId: user._id,
    type: "debit",
    method: instrument_type === "upi" ? "upi" : "bank",
    transfer_amount,
    symbol: "INR",
    status: "processing",
    transferId,
    timestamp: new Date(),
    notes: "Wallet withdrawal",
  });

  return NextResponse.json({
    success: true,
    message: "Withdrawal initiated",
    data: transferResult,
  });
}
