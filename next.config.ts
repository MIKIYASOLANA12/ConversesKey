import type { NextConfig } from 'next';
const nextConfig = {
  allowedDevOrigins: ['192.168.56.1', '192.168.100.31'],
  experimental: {
    turbopack: {
      root: '.'
    }
  }
} as any;
export default nextConfig;