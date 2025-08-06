const CASHFREE_BASE_URL = 'https://sandbox.cashfree.com/payout'
const API_VERSION = '2024-01-01'
const CLIENT_ID = process.env.CASHFREE_CLIENT_ID!
const CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET!

/**
 * Add a beneficiary to Cashfree (supports both bank and UPI)
 */
export async function addBeneficiary({
  beneId,
  name,
  email,
  phone,
  bankAccount,
  ifsc,
  vpa,
}: {
  beneId: string
  name: string
  email: string
  phone: string
  bankAccount?: string
  ifsc?: string
  vpa?: string
}) {
  const payload: any = {
    beneficiary_id: beneId,
    beneficiary_name: name,
    beneficiary_contact_details: {
      beneficiary_email: email,
      beneficiary_phone: phone,
      beneficiary_country_code: '+91',
    },
    beneficiary_instrument_details: {},
  }

  if (vpa) {
    payload.beneficiary_instrument_details.vpa = vpa
  } else if (bankAccount && ifsc) {
    payload.beneficiary_instrument_details.bank_account_number = bankAccount
    payload.beneficiary_instrument_details.bank_ifsc = ifsc
  } else {
    throw new Error('Either VPA or Bank details must be provided')
  }

  const res = await fetch(`${CASHFREE_BASE_URL}/beneficiary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': API_VERSION,
      'x-client-id': CLIENT_ID,
      'x-client-secret': CLIENT_SECRET,
    },
    body: JSON.stringify(payload),
  })

  const result = await res.json()

  if (!res.ok) {
    console.error('Cashfree Error:', result)
    throw new Error(result.message || 'Cashfree API error')
  }

  return result
}

/**
 * Request a transfer to a beneficiary
 */
export async function requestTransfer({
  transferId,
  beneId,
  amount,
  remarks,
}: {
  transferId: string
  beneId: string
  amount: number
  remarks?: string
}) {
  const payload = {
    transfer_id: transferId,
    amount,
    transfer_mode: 'upi', // or 'banktransfer' — UPI is default and sandbox-safe
    remarks: remarks || 'Payout from TradeView',
    bene_id: beneId,
  }

  const res = await fetch(`${CASHFREE_BASE_URL}/payouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': API_VERSION,
      'x-client-id': CLIENT_ID,
      'x-client-secret': CLIENT_SECRET,
    },
    body: JSON.stringify(payload),
  })

  return res.json()
}
