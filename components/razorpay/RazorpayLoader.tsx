// components/RazorpayLoader.tsx
"use client";
import Script from "next/script";

export default function RazorpayLoader() {
  return (
    <Script
      id="razorpay-checkout"
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="afterInteractive"
    />
  );
}
