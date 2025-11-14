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
      config.externals.push({
        "@nutrient-sdk/viewer": "@nutrient-sdk/viewer",
      });
    }

    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(
              __dirname,
              "node_modules/@nutrient-sdk/viewer/dist",
            ),
            to: path.resolve(__dirname, "public"),
            info: () => ({ minimize: true }),
            force: true
          }
        ]
      })
    )
    return config
  }
};

export default nextConfig;
