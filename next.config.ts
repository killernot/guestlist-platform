import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["next-auth", "@auth/core", "@auth/prisma-adapter"],
  },
};

export default nextConfig;
