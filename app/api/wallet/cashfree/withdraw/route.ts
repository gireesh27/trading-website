import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";
import Transaction from "@/lib/Database/Models/Transaction";

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
      beneficiary_name,
      beneficiary_email,
      beneficiary_phone,
      account,
      ifsc,
      vpa,
      beneficiary_address,
      beneficiary_city,
      beneficiary_state,
      beneficiary_postal_code,
      card_token,
      card_network_type,
      transfer_amount,
      instrument_type = "bankaccount",
    } = await req.json();

    if (!transfer_amount || transfer_amount <= 0) {
      return NextResponse.json({ error: "Invalid transfer amount" }, { status: 400 });
    }

    if (
      instrument_type === "bankaccount" &&
      (!account || !ifsc || !beneficiary_email || !beneficiary_phone)
    ) {
      return NextResponse.json({ error: "Missing bank details" }, { status: 400 });
    }

    if (instrument_type === "upi" && !vpa) {
      return NextResponse.json({ error: "Missing UPI VPA for transfer" }, { status: 400 });
    }

    const headers = {
      "Content-Type": "application/json",
      "x-client-id": CF_CLIENT_ID,
      "x-client-secret": CF_CLIENT_SECRET,
      "x-api-version": API_VERSION,
    };

    const transferId = `WD-${Date.now()}`;
    let beneficiaryId: string | null = null;

    // ✅ Step 1: Check or Create Beneficiary
    if (instrument_type === "bankaccount") {
      const lookupUrl = new URL(`${BASE_URL}/beneficiary`);
      lookupUrl.searchParams.set("bank_account_number", account);
      lookupUrl.searchParams.set("bank_ifsc", ifsc);

      const lookupRes = await fetch(lookupUrl.toString(), { method: "GET", headers });
      const lookupData = await lookupRes.json();

      if (lookupRes.ok && lookupData?.data?.beneficiary_id) {
        beneficiaryId = lookupData.data.beneficiary_id;
      } else {
        const createBeneRes = await fetch(`${process.env.NEXTAUTH_URL}/api/wallet/cashfree/add-bene`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            beneficiary_name,
            beneficiary_email,
            beneficiary_phone,
            account,
            ifsc,
            instrument_type,
          }),
        });

        const createBeneData = await createBeneRes.json();

        if (!createBeneRes.ok) {
          return NextResponse.json({ error: "Failed to create beneficiary", details: createBeneData }, { status: 500 });
        }

        beneficiaryId = createBeneData.beneficiary_id;
      }
    }

    // ✅ Step 2: Construct Transfer Payload
    const transferPayload = {
      transfer_id: transferId,
      transfer_amount,
      transfer_currency: "INR",
      transfer_remarks: "withdrawal",
      transfer_mode: instrument_type,
      beneficiary_details: {
        beneficiary_id: beneficiaryId,
        beneficiary_name,
        beneficiary_contact_details: {
          beneficiary_phone,
          beneficiary_email,
          beneficiary_country_code: "+91",
          beneficiary_address,
          beneficiary_city,
          beneficiary_state,
          beneficiary_postal_code,
        },
        beneficiary_instrument_details:
          instrument_type === "upi"
            ? { vpa }
            : {
                bank_account_number: account,
                bank_ifsc: ifsc,
                card_details: {
                  card_token,
                  card_network_type,
                },
              },
      },
    };

    // ✅ Step 3: Perform Transfer
    const transferRes = await fetch(`${BASE_URL}/transfers`, {
      method: "POST",
      headers,
      body: JSON.stringify(transferPayload),
    });

    const transferData = await transferRes.json();

    if (!transferRes.ok) {
      return NextResponse.json({ error: "Transfer failed", details: transferData }, { status: 500 });
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
      status: "processing",
      transferId,
      timestamp: new Date(),
      notes: "Wallet withdrawal",
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal initiated successfully",
      data: transferData,
    });
  } catch (error) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
