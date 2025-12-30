import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = config.externals || [];
    }
    if (isServer) {
      config.externals.push('canvas');
    } return config
  }
};

export default nextConfig;
