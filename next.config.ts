import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.digitaloceanspaces.com' },
      { protocol: 'https', hostname: '*.cdn.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'miro.medium.com' },
      { protocol: 'https', hostname: 'cdn-images-1.medium.com' },
    ],
  },
};

export default nextConfig;
