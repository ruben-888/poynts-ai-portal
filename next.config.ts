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
  webpack: (config, { isServer }) => {
    // If it's a client-side bundle, provide empty mocks for Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        http2: false,
      };
    }
    return config;
  },
};

export default nextConfig;
