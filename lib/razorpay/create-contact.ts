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
      type: "customer", // Always use customer for withdrawals
      reference_id,
      notes: {
        purpose: "Wallet withdrawal", // Optional, for your own internal use
      },
    },
    {
      auth: {
        username: process.env.RAZORPAY_KEY_ID!,
        password: process.env.RAZORPAY_KEY_SECRET!,
      },
    }
  );

  return response.data; // Contact object with id, name, email, etc.
}
