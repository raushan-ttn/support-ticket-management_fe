import type { NextConfig } from 'next';
import path from 'path';

const stylesPath = path.join(process.cwd(), 'src/styles').replace(/\\/g, '/');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  sassOptions: {
    additionalData: `@use "${stylesPath}/abstracts" as *;\n`,
    includePaths: [stylesPath],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['info', 'warn'] } : false,
    styledComponents: true, // if using styled-components
  },
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  devIndicators: false,
  // Enable standalone output for Docker production builds
  output: 'standalone',
};

export default nextConfig;
