/** @type {import('next').NextConfig} */
const nextConfig = {
  env:{
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  NEXT_PUBLIC_RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  // NEXT_PUBLIC_CASHFREE_CLIENT_ID: process.env.CASHFREE_CLIENT_ID,
  // NEXT_PUBLIC_CASHFREE_CLIENT_SECRET: process.env.CASHFREE_CLIENT_SECRET,
  // NEXT_PUBLIC_CASHFREE_PAYOUT_BASE_URL: process.env.CASHFREE_PAYOUT_BASE_URL,
  NEXT_PUBLIC_PAYU_MERCHANT_KEY: process.env.PAYU_MERCHANT_KEY,
  NEXT_PUBLIC_PAYU_SALT: process.env.PAYU_SALT,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false, // ✅ prevents Node 'canvas' module usage
    };
    return config;
  },
};

export default nextConfig;
