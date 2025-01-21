import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "bddvcuswobczqbyjlevs.supabase.co",
      },
    ],
  },
};

export default nextConfig;
