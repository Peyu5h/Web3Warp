import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.notion.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'notion.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.notion.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
