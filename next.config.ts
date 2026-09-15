import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Landlords can paste image URLs from any https host in the property form,
    // so every https hostname is allowed for next/image optimization.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
