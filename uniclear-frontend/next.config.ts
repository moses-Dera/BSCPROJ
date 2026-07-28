import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-lib', 'canvas'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost', port: '5000' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
