import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep isolated production verification beside, never over, the active dev build.
  distDir: process.env.TEST_PRODUCTION_BUILD === "1" ? ".next/test-production" : ".next",
  devIndicators: false,
  allowedDevOrigins: ["192.168.1.38", "127.0.0.1"],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
