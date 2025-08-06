import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase as dbConnect } from '@/lib/Database/mongodb'
import { User } from '@/lib/Database/Models/User'
import Transaction from '@/lib/Database/Models/Transaction'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { addBeneficiary, requestTransfer } from '@/lib/cashfree'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      beneficiary_id,
      beneficiary_name,
      bank_account_number,
      bank_ifsc,
      vpa,
    } = await req.json()

    if (!beneficiary_id || !beneficiary_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // At least one of the payment methods must be provided
    if (!vpa && (!bank_account_number || !bank_ifsc)) {
      return NextResponse.json(
        { error: 'Provide either a valid UPI ID or both bank account and IFSC' },
        { status: 400 }
      )
    }

    const amount = 100 // You can allow amount input too from frontend later

    await dbConnect()
    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.walletBalance < amount) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 })
    }

    const transferId = `TRF_${crypto.randomUUID()}`

    // STEP 1: Create Beneficiary via Cashfree
    const beneRes = await addBeneficiary({
      beneId: beneficiary_id,
      name: beneficiary_name,
      email: session.user.email,
      phone: user.phone ?? '9999999999', // fallback for testing
      bankAccount: bank_account_number,
      ifsc: bank_ifsc,
      vpa,
    })

    if (beneRes?.subCode !== '200') {
      return NextResponse.json({ error: 'Beneficiary creation failed', details: beneRes }, { status: 500 })
    }

    // STEP 2: Request Transfer
    const transferRes = await requestTransfer({
      transferId,
      beneId: beneficiary_id,
      amount,
      remarks: 'Wallet withdrawal',
    })

    if (transferRes.status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Transfer failed', details: transferRes }, { status: 500 })
    }

    // STEP 3: Update wallet balance and log transaction
    user.walletBalance -= amount
    await user.save()

    await Transaction.create({
      userId: user._id,
      type: 'debit',
      method: vpa ? 'upi' : 'bank',
      amount,
      symbol: 'INR',
      status: 'processing',
      transferId,
      timestamp: new Date(),
      notes: 'Wallet withdrawal',
    })

    return NextResponse.json({ success: true, transferId })
  } catch (err: any) {
    console.error('[WITHDRAW_ERROR]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
