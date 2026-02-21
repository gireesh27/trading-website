import axios from "axios";

export async function createRazorpayContact({
  name,
  email,
  contact,
  reference_id,
}: {
  name: string;
  email: string;
  contact: string;
  reference_id: string;
}) {
  const response = await axios.post(
    "https://api.razorpay.com/v1/contacts",
    {
      name,
      email,
      contact,
      type: "customer",
      reference_id,
      notes: {
        purpose: "Wallet withdrawal",
      },
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
