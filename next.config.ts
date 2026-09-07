import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.1.38", "127.0.0.1"],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
