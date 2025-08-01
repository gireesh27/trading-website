// /lib/razorpay.ts
import Razorpay from "razorpay";

export const razorpayX = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
