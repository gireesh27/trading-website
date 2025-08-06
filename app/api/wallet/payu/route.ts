import { generatePayUHash, generateTxnId, PaymentFormData, PayUHashParams } from '@/lib/payu';
import Transaction from '@/lib/Database/Models/Transaction';
import { connectToDatabase as dbConnect } from '@/lib/Database/mongodb';
import { User } from "@/lib/Database/Models/User";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    await dbConnect();

    if (!session?.user?.id) {
      console.log("Unauthorized");
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });
    }

    const body: PaymentFormData = await req.json();
    const { amount, productinfo, firstname, email, phone } = body;

    if (!amount || !productinfo || !firstname || !email || !phone) {
      console.log("Missing required fields");
      return new Response(JSON.stringify({ success: false, message: "Missing required fields" }), { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      console.log("User not found");
      return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });
    }

    if (user.walletBalance < parseFloat(amount)) {
      console.log("Insufficient Funds");
      return new Response(JSON.stringify({ success: false, message: "Insufficient Funds" }), { status: 400 });
    }

    const txnid = generateTxnId();
    console.log("txnid:", txnid);

    const transaction = new Transaction({
      userId: user._id,
      type: 'debit',
      amount: parseFloat(amount),
      status: 'pending',
      source: 'external',
      transferId: txnid,
      remarks: productinfo,
    });

    await transaction.save();
    console.log("transaction:", transaction);

    // Prepare basic PayU data
    const payuData: PayUHashParams = {
      key: process.env.PAYU_MERCHANT_KEY!,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      udf1: '',
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
    };

    // Generate hash
    const salt = process.env.PAYU_SALT;

    if (!salt) {
      console.error('PAYU_SALT is not defined in environment variables.');
      throw new Error("PAYU_SALT is not defined in environment variables.");
    }

    const hash = generatePayUHash(payuData, salt);
    console.log('PayU Hash:', hash);

    // Final payload sent to PayU
    const paymentData = {
      ...payuData,
      hash,
      phone,
      surl: `${process.env.NEXTAUTH_URL}/api/wallet/payu/success`,
      furl: `${process.env.NEXTAUTH_URL}/api/wallet/payu/failure`,
      service_provider: 'payu_paisa',
    };

    console.log('Payment Data:', paymentData);


    // Return to frontend
    return new Response(JSON.stringify({ success: true, paymentData }), {
      status: 200,
    });


  } catch (error) {
    console.log("error:", error);
    console.error('Payment initiation error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Payment initiation failed' }), { status: 500 });
  }
}
