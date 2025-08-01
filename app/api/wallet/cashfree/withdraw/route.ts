import { NextResponse } from "next/server";
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";
import TransactionModel from "@/lib/Database/Models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

import crypto from "crypto";

// Helper: Generate RSA X-Cf-Signature
function generateCashfreeSignature() {
  const clientId = process.env.CASHFREE_CLIENT_ID!;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = `${clientId}.${timestamp}`;

  const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtMlxd9nGI57WmLGAoo55
W/1J4YMDjYsgue9EI3yb4GSItdwi3xznJZLC7pbMTvD6K9T8VAE9dMCjuOtwnMwh
yxt7FRAPF0yG+9gFIkE3szweV/o1vQrXCSVHKX9hGvab1z/X11AyZVa0NrpcXOQV
A0oByCyGmuz6kt8lW9bISytHQVyyCobJWaIBJ7pQ5gIEPqNI+lSLtdu+s5vHeu7l
BPoIpKkT9dDJO9E+lPa5dA6A35qtbkyfIzXJnaTTRspDpxH3otiph9ZXrijPNfO0
DIhQsOv5mTEbVt4frkL8L2CnmLnxO/Z8V0pfyDgkn00eXa0IUHhDgvtXDfoWArno
bwIDAQAB
-----END PUBLIC KEY-----`;

  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(message)
  );

  const xCfSignature = encrypted.toString("base64");
  return { xCfSignature };
}

// POST /api/wallet/cashfree/withdraw
export async function POST(req: Request) {
  await dbConnect();

    const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, bankAccount, ifsc, name } = await req.json();
  if (!amount || !bankAccount || !ifsc || !name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!user || user.walletBalance < amount) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const beneficiaryId = `bene_${user._id}`;
  const transferId = `tx_${user._id}_${Date.now()}`;

  const addBeneBody = {
    beneId: beneficiaryId,
    name,
    email: user.email,
    phone: user.phone || "9999999999",
    bankAccount,
    ifsc,
    address1: "India",
  };

  const { xCfSignature } = generateCashfreeSignature();
   console.log("x-cf-signature:  ",xCfSignature)
  try {
    // Add beneficiary
    const addBeneRes = await fetch("https://sandbox.cashfree.com/payout/v2/addBeneficiary", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Cf-Client-Id": process.env.CASHFREE_CLIENT_ID!,
        "X-Cf-Signature": xCfSignature,
      },
      body: JSON.stringify(addBeneBody),
    });

    const addBeneData = await addBeneRes.json();
    console.log("📩 Add Beneficiary Response:", addBeneData);

    if (addBeneData.status !== "SUCCESS" && addBeneData.subCode !== "409") {
      return NextResponse.json({ error: "Add beneficiary failed", detail: addBeneData }, { status: 400 });
    }

    // Initiate transfer
    const transferBody = {
      beneId: beneficiaryId,
      amount,
      transferId,
      transferMode: "banktransfer",
    };

    const transferRes = await fetch("https://sandbox.cashfree.com/payout/v2/requestTransfer", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Cf-Client-Id": process.env.CASHFREE_CLIENT_ID!,
        "X-Cf-Signature": xCfSignature,
      },
      body: JSON.stringify(transferBody),
    });

    const transferData = await transferRes.json();
    console.log("💸 Transfer Response:", transferData);

    if (transferData.status === "SUCCESS") {
      user.walletBalance -= amount;
      await user.save();

      return NextResponse.json({ success: true, transferId });
    } else {
      return NextResponse.json({ error: "Transfer failed", detail: transferData }, { status: 400 });
    }
  } catch (error) {
    console.error("🔥 Cashfree withdrawal failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
