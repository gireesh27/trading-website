import axios from "axios";

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID!;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET!;
const CASHFREE_BASE_URL = "https://payout-gamma.cashfree.com";

// Step A: Get Auth Token
export async function getCashfreeToken(): Promise<string> {
  const { data } = await axios.post(
    `${CASHFREE_BASE_URL}/payout/v1/authorize`,
    {},
    {
      headers: {
        "X-Client-Id": CASHFREE_CLIENT_ID,
        "X-Client-Secret": CASHFREE_CLIENT_SECRET,
      },
    }
  );

  if (data.status !== "SUCCESS") {
    throw new Error(data.message || "Failed to authorize Cashfree");
  }

  return data.data.token;
}

// Step B: Add Beneficiary (Bank or UPI)
export async function addBeneficiary(
  token: string,
  input: {
    name: string;
    phone: string;
    email?: string;
    upi?: string;
    bankAccount?: string;
    ifsc?: string;
  }
) {
  const { name, phone, email = "", upi, bankAccount, ifsc } = input;

  const payload: any = {
    beneId: phone,
    name,
    email,
    phone,
  };

  if (upi) {
    payload.upi = upi;
  } else {
    payload.bankAccount = bankAccount;
    payload.ifsc = ifsc;
    payload.address1 = "NA";
    payload.city = "NA";
    payload.state = "NA";
    payload.pincode = "000000";
  }

  const { data } = await axios.post(
    `${CASHFREE_BASE_URL}/payout/v1/addBeneficiary`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (data.status !== "SUCCESS") {
    throw new Error(data.message || "Failed to add beneficiary");
  }

  return data;
}

// Step C: Request Payout
export async function requestTransfer(
  token: string,
  {
    beneId,
    amount,
    transferId,
    remarks = "Wallet withdrawal",
  }: {
    beneId: string;
    amount: number;
    transferId: string;
    remarks?: string;
  }
) {
  const payload = {
    beneId,
    amount,
    transferId,
    remarks,
  };

  const { data } = await axios.post(
    `${CASHFREE_BASE_URL}/payout/v1/requestTransfer`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (data.status !== "SUCCESS") {
    throw new Error(data.message || "Transfer failed");
  }

  return data;
}
