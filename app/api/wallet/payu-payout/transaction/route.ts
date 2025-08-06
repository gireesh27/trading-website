import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { access_token } = await req.json();

  const res = await fetch('https://uatoneapi.payu.in/payout/payment/listTransactions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}), // Can include filters if required
  });

  const data = await res.json();
  return NextResponse.json(data);
}
