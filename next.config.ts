import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // 💥 disables type-check build errors
  },
  eslint: {
    ignoreDuringBuilds: true, // 💥 disables eslint build errors
  },
  images: {
    domains: [
      'images.unsplash.com',
      'randomuser.me',
      'images.pexels.com',
    ],
  },
};

export default nextConfig;
