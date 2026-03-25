import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance and security
  reactStrictMode: true,
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Build configuration - ignore TypeScript errors for deployment
  typescript: {
    ignoreBuildErrors: true,
  },

  // Turbopack configuration
  turbopack: {},

  // Disable source maps for production
  productionBrowserSourceMaps: false,

  // Webpack config for non-Turbopack builds
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize chunk splitting for large bundles
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          chunks: 'all',
          maxSize: 500000, // 500KB max chunk size
          cacheGroups: {
            // Vendor chunk for node_modules
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Rewrite .well-known/farcaster.json to API route
  async rewrites() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: '/api/farcaster/manifest',
      },
    ];
  },
};

export default nextConfig;
