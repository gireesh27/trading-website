import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { access_token, amount, accountNumber, ifsc, merchantRefId, remarks } = await req.json();

  const payload = {
    merchantRefId,
    paymentDetails: [
      {
        mode: 'IMPS',
        purpose: 'payout',
        amount,
        instrumentId: accountNumber,
        ifsc,
        remarks,
      },
    ],
  };

  const res = await fetch('https://uatoneapi.payu.in/payout/v2/payment', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return NextResponse.json(data);
}

