import { NextResponse } from 'next/server';

export async function POST() {
  const form = new URLSearchParams();
  form.append('grant_type', 'password');
  form.append('scope', 'create_payout_transactions');
  form.append('client_id', process.env.PAYU_PAYOUT_CLIENT_ID!);
  form.append('username', process.env.PAYU_PAYOUT_USERNAME!);
  form.append('password', process.env.PAYU_PAYOUT_PASSWORD!);

  const res = await fetch('https://uat-accounts.payu.in/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
