const CASHFREE_BASE_URL = 'https://sandbox.cashfree.com/payout';
const API_VERSION = '2024-01-01';
const CLIENT_ID = process.env.CASHFREE_CLIENT_ID!;
const CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET!;

/**
 * Find beneficiary by account number and IFSC and return all its data
 */
export async function getBeneficiaryByAccount(
  accountNumber: string,
  ifsc: string
): Promise<any | null> {
  const url = new URL(`${CASHFREE_BASE_URL}/beneficiary`);
  url.searchParams.append('bank_account_number', accountNumber);
  url.searchParams.append('bank_ifsc', ifsc);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': API_VERSION,
      'x-client-id': CLIENT_ID,
      'x-client-secret': CLIENT_SECRET,
    },
  });

  const data = await res.json();

  if (res.ok && data?.status === 'SUCCESS' && data?.data) {
    return data.data;
  }

  return null;
}
export async function addBeneficiary({
  beneId,
  name,
  email,
  phone,
  bankAccount,
  ifsc,
  vpa,
  cardNumber,
}: {
  beneId: string
  name: string
  email: string
  phone: string
  bankAccount?: string
  ifsc?: string
  vpa?: string
  cardNumber?: string
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
export async function requestTransferFull({
  transferId,
  amount,
  remarks,
  beneficiary,
}: {
  transferId: string
  amount: number
  remarks?: string
  beneficiary: {
    beneficiary_id: string
    beneficiary_name: string
    contact: {
      postal_code: string
      phone: string
      email: string
      country_code: string
      address: string
      city: string
      state: string
    }
    instrument: {
      bank_account_number: string
      bank_ifsc: string
      vpa?: string
      card_details?: {
        card_network_type: string
        card_token: string
      }
    }
  }
}) {
  const payload = {
    transfer_id: transferId,
    transfer_mode: 'imps',
    transfer_currency: 'INR',
    transfer_remarks: remarks || 'withdrawal',
    transfer_amount: amount,
    beneficiary_details: {
      beneficiary_id: beneficiary.beneficiary_id,
      beneficiary_name: beneficiary.beneficiary_name,
      beneficiary_contact_details: {
        beneficiary_postal_code: beneficiary.contact.postal_code,
        beneficiary_phone: beneficiary.contact.phone,
        beneficiary_email: beneficiary.contact.email,
        beneficiary_country_code: beneficiary.contact.country_code,
        beneficiary_address: beneficiary.contact.address,
        beneficiary_city: beneficiary.contact.city,
        beneficiary_state: beneficiary.contact.state,
      },
      beneficiary_instrument_details: {
        bank_account_number: beneficiary.instrument.bank_account_number,
        bank_ifsc: beneficiary.instrument.bank_ifsc,
        ...(beneficiary.instrument.vpa && { vpa: beneficiary.instrument.vpa }),
        ...(beneficiary.instrument.card_details && {
          card_details: beneficiary.instrument.card_details,
        }),
      },
    },
  }

  const res = await fetch(`${CASHFREE_BASE_URL}/transfers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': '2024-01-01',
      'x-client-id': process.env.CASHFREE_CLIENT_ID!,
      'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
    },
    body: JSON.stringify(payload),
  })

  return res.json()
}