
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // Keep any other experimental features here if needed in the future
  },
  // This is the fix for the cross-origin error in the development environment.
  allowedDevOrigins: ["https://*.cluster-oayqgyglpfgseqclbygurw4xd4.cloudworkstations.dev"],
};

export default nextConfig;
