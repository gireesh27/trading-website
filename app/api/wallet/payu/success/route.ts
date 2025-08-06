import { verifyPayUResponse, PayUResponse } from '@/lib/payu';
import Transaction from '@/lib/Database/Models/Transaction';
import { connectToDatabase as dbConnect } from '@/lib/Database/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@/lib/Database/Models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface PaymentSuccessRequest extends NextApiRequest {
  body: PayUResponse;
}

export default async function handler(req: PaymentSuccessRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return res.redirect('/wallet/error?message=Unauthorized');
    }

    await dbConnect();

    const payuResponse: PayUResponse = req.body;
    const isValid = verifyPayUResponse(payuResponse, process.env.PAYU_SALT!);

    if (!isValid) {
      return res.redirect('/wallet/error?message=Invalid payment response');
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.redirect('/wallet/error?message=User not found');
    }

    const amount = parseFloat(payuResponse.amount);

    // Check for duplicate transaction before updating
    const txn = await Transaction.findOneAndUpdate(
      { txnid: payuResponse.txnid },
      {
        status: payuResponse.status === 'success' ? 'success' : 'failed',
        payuResponse: payuResponse,
        updatedAt: new Date(),
      }
    );

    if (!txn) {
      return res.redirect('/wallet/error?message=Transaction not found');
    }

    // Update wallet balance only if transaction was successful and not already deducted
    if (payuResponse.status === 'success') {
      // Ensure balance is sufficient
      if (user.walletBalance < amount) {
        return res.redirect('/wallet/error?message=Insufficient balance');
      }

      user.walletBalance += amount;
      await user.save();
      console.log('Updated walletBalance:', user.walletBalance);
    }

    res.redirect(`/wallet/success?txnid=${payuResponse.txnid}`);
  } catch (error) {
    console.error('Payment success handling error:', error);
    res.redirect('/wallet/error?message=Payment processing failed');
  }
}
