import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";
import Transaction from "@/lib/Database/Models/Transaction";
import { generateBeneficiaryId } from "@/lib/utils/bene_id";
import bcrypt from "bcryptjs";

const BASE_URL = "https://sandbox.cashfree.com/payout";
const CF_CLIENT_ID = process.env.CASHFREE_CLIENT_ID!;
const CF_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET!;
const API_VERSION = "2024-01-01";

export async function POST(req: NextRequest) {
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

    const {
      beneficiary_id,
      beneficiary_name,
      beneficiary_email,
      beneficiary_phone,
      bank_account_number,
      bank_ifsc,
      vpa,
      beneficiary_address,
      beneficiary_city,
      beneficiary_state,
      beneficiary_postal_code,
      card_token,
      card_network_type,
      transfer_amount,
      instrument_type = "bankaccount",
      walletPassword
    } = await req.json();
    if (!transfer_amount || transfer_amount <= 0) {
      console.log("Invalid transfer amount:", transfer_amount)
      return NextResponse.json({ error: "Invalid transfer amount" }, { status: 400 });
    }

    if (
      instrument_type === "bankaccount" &&
      (!bank_account_number || !bank_account_number || !beneficiary_email || !beneficiary_phone)
    ) {
      console.log("Missing bank details:", { bank_account_number, bank_ifsc, beneficiary_email, beneficiary_phone })
      return NextResponse.json({ error: "Missing bank details" }, { status: 400 });
    }

    if (instrument_type === "upi" && !vpa) {
      console.log("Missing UPI VPA for transfer:", vpa)
      return NextResponse.json({ error: "Missing UPI VPA for transfer" }, { status: 400 });
    }
    if (!walletPassword) {
      return NextResponse.json({ error: "Wallet password is required" }, { status: 400 });
    }

    if (!user.walletPasswordHash) {
      return NextResponse.json({ error: "Wallet password not set" }, { status: 403 });
    }

    const isValidPassword = await bcrypt.compare(walletPassword, user.walletPasswordHash);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid wallet password" }, { status: 403 });
    }
    const headers = {
      "Content-Type": "application/json",
      "x-client-id": CF_CLIENT_ID,
      "x-client-secret": CF_CLIENT_SECRET,
      "x-api-version": API_VERSION,
    };

    const transferId = `WD-${Date.now()}`;
    let beneficiaryId: string | null = beneficiary_id || null;
    console.log("beneficiaryId:", beneficiaryId);
    console.log("Trnsfer_id:", transferId);
    if (!beneficiaryId && instrument_type === "bankaccount") {
      const lookupUrl = new URL(`${BASE_URL}/beneficiary`);
      lookupUrl.searchParams.set("bank_account_number", bank_account_number);
      lookupUrl.searchParams.set("bank_ifsc", bank_ifsc);

      const lookupRes = await fetch(lookupUrl.toString(), { method: "GET", headers });
      const lookupData = await lookupRes.json();
      console.log("lookupData:", lookupData);

      if (lookupRes.ok && lookupData?.data?.beneficiary_id) {
        beneficiaryId = lookupData.data.beneficiary_id;
        console.log("Found beneficiaryId:", beneficiaryId);
      } else {
        const validBeneId = generateBeneficiaryId();

        const createBeneRes = await fetch(`${process.env.NEXTAUTH_URL}/api/wallet/cashfree/add-bene`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            beneId: validBeneId,
            name: beneficiary_name,
            email: beneficiary_email,
            phone: beneficiary_phone,
            bankAccount: bank_account_number,
            ifsc: bank_ifsc,
            address: beneficiary_address,
            city: beneficiary_city,
            state: beneficiary_state,
            postalCode: beneficiary_postal_code,
            cardToken: card_token,
            cardNetworkType: card_network_type,
            instrumentType: instrument_type,
          }),
        });

        const createBeneData = await createBeneRes.json();

        if (!createBeneRes.ok) {
          return NextResponse.json(
            { error: "Failed to create beneficiary", details: createBeneData },
            { status: 500 }
          );
        }

        beneficiaryId = createBeneData.beneficiary_id || validBeneId;
        console.log("Created beneficiaryId:", beneficiaryId);
      }
    }
    // ✅ Step 2: Construct Transfer Payload
    const transferPayload = {
      transfer_id: transferId,
      transfer_amount,
      beneficiary_details: {
        beneficiary_id,
        beneficiary_name,
        beneficiary_email,
        beneficiary_phone,
      }

    };

    // ✅ Step 3: Perform Transfer
    const transferRes = await fetch(`${BASE_URL}/transfers`, {
      method: "POST",
      headers,
      body: JSON.stringify(transferPayload),
    });

    const transferData = await transferRes.json();
    if (!transferRes.ok) {
      return NextResponse.json(
        { error: "Transfer failed", details: transferData },
        { status: 500 }
      );
    }
    // ✅ Step 4: Update Wallet and Log Transaction
    user.walletBalance -= transfer_amount;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: "debit",
      method: instrument_type,
      symbol: "INR",
      transfer_amount,
      status: "completed",
      transferId,
      timestamp: new Date(),
      notes: "Wallet withdrawal",
    });

    return NextResponse.json({
      success: true,
      status: "SUCCESS",
      message: "Transfer marked as success (pending on Cashfree side)",
      data: transferData,
    });
  } catch (error) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
