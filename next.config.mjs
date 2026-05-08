/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Next.js 16 projects using Turbopack.
  turbopack: {},

  images: {
    unoptimized: true,
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
