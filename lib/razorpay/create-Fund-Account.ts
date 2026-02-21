import axios from "axios";

export async function createRazorpayFundAccount({
  contact_id,
  upi,
  ifsc,
  account_number,
  name,
}: {
  contact_id: string;
  upi?: string;
  ifsc?: string;
  account_number?: string;
  name?: string;
}) {
  const account_type = upi ? "vpa" : "bank_account";

  const payload =
    account_type === "vpa"
      ? {
        contact_id,
        account_type,
        vpa: {
          address: upi!,
        },
      }
      : {
        contact_id,
        account_type,
        bank_account: {
          name: name!,
          ifsc: ifsc!,
          account_number: account_number!,
        },
      };

  const response = await axios.post(
    "https://api.razorpay.com/v1/fund_accounts",
    payload,
    {
      auth: {
        username: process.env.RAZORPAY_KEY_ID!,
        password: process.env.RAZORPAY_KEY_SECRET!,
      },
    }
  );

  return response.data;
}
