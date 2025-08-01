// /app/api/admin/withdrawals/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import {connectToDatabase as connectDB} from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";
import TransactionModel from "@/lib/Database/Models/Transaction";
import Withdrawal from "@/lib/Database/Models/withdrawl"
import axios from "axios";

export async function POST(req: NextRequest) {
  await connectDB();
  const { withdrawalId } = await req.json();

  const withdrawal = await Withdrawal.findById(withdrawalId);
  if (!withdrawal || withdrawal.status !== "pending") {
    return NextResponse.json({ error: "Invalid withdrawal" }, { status: 400 });
  }

  const user = await User.findOne({ userId: withdrawal.userId });
  if (!user || user.walletBalance < withdrawal.amount) {
    return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
  }

  const transferId = `tx_${withdrawal.userId}_${Date.now()}`;
  const headers = {
    accept: "application/json",
    "x-client-id": process.env.CASHFREE_CLIENT_ID!,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
    "x-api-version": "2022-01-01",
    "content-type": "application/json"
  };

  try {
    const res = await axios.post(
      "https://payout-api.cashfree.com/payout/v2/requestTransfer",
      {
        beneId: withdrawal.beneficiaryId,
        amount: withdrawal.amount.toFixed(2),
        transferId,
        transferMode: "IMPS",
        remarks: withdrawal.remarks || "Wallet Withdrawal",
      },
      { headers }
    );

    withdrawal.status = "transferred";
    withdrawal.transferId = transferId;
    withdrawal.approvedAt = new Date();
    await withdrawal.save();

    user.walletBalance -= withdrawal.amount;
    await user.save();

    await TransactionModel.create({
      userId: withdrawal.userId,
      amount: withdrawal.amount,
      type: "debit",
      status: "completed",
      source: "wallet",
      remarks: withdrawal.remarks,
      transferId
    });

    return NextResponse.json({ success: true, transferId });
  } catch (err: any) {
    withdrawal.status = "failed";
    await withdrawal.save();
    return NextResponse.json({ error: "Transfer failed" }, { status: 500 });
  }
}
