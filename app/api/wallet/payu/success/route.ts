import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { verifyPayUResponse, PayUResponse } from "@/lib/payu";
import Transaction from "@/lib/Database/Models/Transaction";
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function readPayUResponse(req: NextRequest): Promise<PayUResponse> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await req.json()) as PayUResponse;
  }

  const formData = await req.formData();
  return Object.fromEntries(formData.entries()) as unknown as PayUResponse;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/wallet/error?message=Unauthorized", req.url));
    }

    await dbConnect();

    const payuResponse = await readPayUResponse(req);
    const isValid = verifyPayUResponse(payuResponse, process.env.PAYU_SALT || "");

    if (!isValid) {
      return NextResponse.redirect(new URL("/wallet/error?message=Invalid%20payment%20response", req.url));
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.redirect(new URL("/wallet/error?message=User%20not%20found", req.url));
    }

    const amount = Number.parseFloat(payuResponse.amount);
    const txn = await Transaction.findOneAndUpdate(
      { txnid: payuResponse.txnid },
      {
        status: payuResponse.status === "success" ? "success" : "failed",
        payuResponse,
        updatedAt: new Date(),
      }
    );

    if (!txn) {
      return NextResponse.redirect(new URL("/wallet/error?message=Transaction%20not%20found", req.url));
    }

    if (payuResponse.status === "success") {
      user.walletBalance += amount;
      await user.save();
    }

    return NextResponse.redirect(new URL(`/wallet/success?txnid=${payuResponse.txnid}`, req.url));
  } catch (error) {
    console.error("Payment success handling error:", error);
    return NextResponse.redirect(new URL("/wallet/error?message=Payment%20processing%20failed", req.url));
  }
}
