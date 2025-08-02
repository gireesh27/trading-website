/** @type {import('next').NextConfig} */
const nextConfig = {
  env:{
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  NEXT_PUBLIC_RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
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
