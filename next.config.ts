import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["next-auth", "@auth/core", "@auth/prisma-adapter"],
};

export default nextConfig;
