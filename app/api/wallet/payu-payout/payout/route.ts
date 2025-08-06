import { NextResponse } from "next/server";

// ENV variables must be set in .env.local
const {
  PAYU_CLIENT_ID,
  PAYU_CLIENT_SECRET,
  PAYU_PAYOUT_ACCOUNT_NUMBER,
} = process.env;

// UAT (sandbox) endpoint
const PAYU_OAUTH_URL = "https://uat-accounts.payu.in/oauth/token";
const PAYU_PAYOUT_URL = "https://uat-payout.payu.in/mockwallet/upi/payout";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, upiVpa, remarks } = body;

    if (!amount || !upiVpa) {
      return NextResponse.json({ error: "Amount and UPI VPA are required." }, { status: 400 });
    }

    // STEP 1: Get OAuth access token
    const authRes = await fetch(PAYU_OAUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: PAYU_CLIENT_ID!,
        client_secret: PAYU_CLIENT_SECRET!,
      }),
    });

    const authData = await authRes.json();

    if (!authRes.ok) {
      return NextResponse.json({ error: "Failed to authenticate with PayU", details: authData }, { status: 500 });
    }

    const accessToken = authData.access_token;

    // STEP 2: Make payout request
    const payoutRes = await fetch(PAYU_PAYOUT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_number: PAYU_PAYOUT_ACCOUNT_NUMBER!,
        amount: amount.toString(),
        merchant_reference_id: `PAYOUT_${Date.now()}`,
        remarks: remarks || "Payout from app",
        payee_email: "placeholder@email.com", // optional
        payee_phone: "9999999999",            // optional
        upi_vpa: upiVpa,
      }),
    });

    const payoutData = await payoutRes.json();

    if (!payoutRes.ok) {
      return NextResponse.json({ error: "Payout failed", details: payoutData }, { status: 500 });
    }

    return NextResponse.json({ success: true, payout: payoutData });
  } catch (error) {
    console.error("PAYU_PAYOUT_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
