/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Add empty turbopack config (required for Next.js 16)
  turbopack: {},

  env: {
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    NEXT_PUBLIC_PAYU_MERCHANT_KEY: process.env.PAYU_MERCHANT_KEY,

    // Server-only env variables
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    PAYU_SALT: process.env.PAYU_SALT
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

  // Keeping your webpack fallback (allowed with turbopack: {})
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
