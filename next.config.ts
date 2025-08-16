
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
    remotePatterns: [],
  },
  webpack: (config, { isServer }) => {
    // This is to make sure that the `node-thermal-printer` and `get-pixels` libraries,
    // which are Node.js specific, are not included in the client-side bundle.
    // They will only be bundled for the server-side, which is our API route.
    if (!isServer) {
        config.externals.push('node-thermal-printer');
        config.externals.push('get-pixels');
    }
    return config;
  },
};

export default nextConfig;
