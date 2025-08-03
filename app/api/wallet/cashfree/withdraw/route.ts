import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Transaction from '@/lib/Database/Models/Transaction';
import {
  addBeneficiary,
  requestTransfer,
} from '@/lib/cashfree';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bank, ifsc, name, email, amount, phone } = await req.json();
    if (!bank || !ifsc || !name || !email || !amount || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.walletBalance < amount) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    const beneId = `BENE_${user._id}`;
    const transferId = `TRF_${crypto.randomUUID()}`;

    // STEP 1: Add Beneficiary
    const beneRes = await addBeneficiary({
      beneId,
      name,
      email,
      phone,
      bankAccount: bank,
      ifsc
    });

    if (beneRes?.subCode !== '200') {
      return NextResponse.json({ error: 'Beneficiary creation failed', details: beneRes }, { status: 500 });
    }

    // STEP 2: Request Transfer (Sandbox doesn't need signature/encryption)
    const transferRes = await requestTransfer({
      transferId,
      beneId,
      amount,
      remarks: 'Withdrawal'
    });

    if (transferRes.status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Transfer failed', details: transferRes }, { status: 500 });
    }

    // STEP 3: Deduct Wallet & Log Transaction
    user.walletBalance -= amount;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'debit',
      method: 'cashfree',
      amount,
      symbol: 'INR',
      status: 'processing',
      transferId,
      timestamp: new Date(),
      notes: 'Wallet withdrawal'
    });

    return NextResponse.json({ success: true, transferId });
  } catch (err: any) {
    console.error('[CASHFREE_WITHDRAW_ERROR]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
