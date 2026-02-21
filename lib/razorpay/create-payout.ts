import axios from "axios";

export async function createRazorpayPayout({
  fund_account_id,
  amount,
  mode,
  reference_id,
  narration = "Wallet Withdrawal",
}: {
  fund_account_id: string;
  amount: number;
  mode: "UPI" | "IMPS";
  reference_id: string;
  narration?: string;
}) {
  const response = await axios.post(
    "https://api.razorpay.com/v1/payouts",
    {
      account_number: process.env.RAZORPAYX_ACCOUNT!,
      fund_account_id,
      amount,
      currency: "INR",
      mode,
      purpose: "payout",
      queue_if_low_balance: true,
      narration,
      reference_id,
    },
    {
      auth: {
        username: process.env.RAZORPAY_KEY_ID!,
        password: process.env.RAZORPAY_KEY_SECRET!,
      },
    }
  );

  return response.data;
}
