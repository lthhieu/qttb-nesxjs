import CopyPlugin from "copy-webpack-plugin";
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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
