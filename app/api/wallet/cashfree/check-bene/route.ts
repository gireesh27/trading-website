import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://sandbox.cashfree.com/payout";
const API_VERSION = "2024-01-01";
const CLIENT_ID = process.env.CASHFREE_CLIENT_ID!;
const CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bank_account_number = searchParams.get("bank_account_number");
  const bank_ifsc = searchParams.get("bank_ifsc");

  if (!bank_account_number || !bank_ifsc) {
    return NextResponse.json(
      {
        error: "Both 'bank_account_number' and 'bank_ifsc' are required in query parameters.",
      },
      { status: 400 }
    );
  }

  const url = new URL(`${BASE_URL}/beneficiary`);
  url.searchParams.append("bank_account_number", bank_account_number);
  url.searchParams.append("bank_ifsc", bank_ifsc);

  const headers = {
    "Content-Type": "application/json",
    "x-api-version": API_VERSION,
    "x-client-id": CLIENT_ID,
    "x-client-secret": CLIENT_SECRET,
  };

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    const data = await response.json();

    if (!response.ok || !data?.beneficiary_id) {
      return NextResponse.json(
        {
          message: "Beneficiary not found or not active",
          details: data,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      beneficiary_id: data.beneficiary_id,
      beneficiary_name: data.beneficiary_name,
      beneficiary_status: data.beneficiary_status,
      bank_account_number: data.beneficiary_instrument_details?.bank_account_number,
      bank_ifsc: data.beneficiary_instrument_details?.bank_ifsc,
      vpa: data.beneficiary_instrument_details?.vpa,
      phone: data.beneficiary_contact_details?.beneficiary_phone,
      email: data.beneficiary_contact_details?.beneficiary_email,
      address: data.beneficiary_contact_details?.beneficiary_address,
      city: data.beneficiary_contact_details?.beneficiary_city,
      state: data.beneficiary_contact_details?.beneficiary_state,
      postal_code: data.beneficiary_contact_details?.beneficiary_postal_code,
      added_on: data.added_on,
    });
  } catch (error) {
    console.error("Error fetching beneficiary from Cashfree:", error);
    return NextResponse.json(
      { error: "Internal Server Error while checking beneficiary" },
      { status: 500 }
    );
  }
}
