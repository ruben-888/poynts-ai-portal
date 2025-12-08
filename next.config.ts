import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  output: "standalone",
  serverExternalPackages: ["@statsig/statsig-node-core"],
  typescript: {
    // This will ignore TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
  // Next.js 16 uses Turbopack by default - empty config acknowledges this
  turbopack: {},
};

export default nextConfig;
