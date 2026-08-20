import type { NextConfig } from "next";

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  experimental: {
    externalDir: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
} satisfies NextConfig;

export default nextConfig;
