import { NextRequest, NextResponse } from "next/server";
import { PayUResponse } from "@/lib/payu";
import Transaction from "@/lib/Database/Models/Transaction";
import { connectToDatabase as dbConnect } from "@/lib/Database/mongodb";

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
    await dbConnect();

    const payuResponse = await readPayUResponse(req);

    await Transaction.findOneAndUpdate(
      { txnid: payuResponse.txnid },
      {
        status: "failed",
        payuResponse,
        updatedAt: new Date(),
      }
    );

    return NextResponse.redirect(new URL(`/wallet/failure?txnid=${payuResponse.txnid}`, req.url));
  } catch (error) {
    console.error("Error in PayU failure handler:", error);
    return NextResponse.redirect(new URL("/wallet/error?message=Payment%20processing%20failed", req.url));
  }
}
