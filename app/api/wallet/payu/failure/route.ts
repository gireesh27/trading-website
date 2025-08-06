import { PayUResponse } from '@/lib/payu';
import Transaction from '@/lib/Database/Models/Transaction';
import { connectToDatabase as dbConnect } from '@/lib/Database/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

interface PaymentFailureRequest extends NextApiRequest {
  body: PayUResponse;
}

export default async function handler(
  req: PaymentFailureRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();

    const payuResponse: PayUResponse = req.body;

    console.log('PayU Failure Response:', payuResponse);

    await Transaction.findOneAndUpdate(
      { txnid: payuResponse.txnid },
      {
        status: 'failed',
        payuResponse: payuResponse,
        updatedAt: new Date()
      }
    );

    res.redirect(`/wallet/failure?txnid=${payuResponse.txnid}`);
  } catch (error) {
    console.error('Error in failure handler:', error);
    res.redirect('/wallet/error?message=Payment processing failed');
  }
}
