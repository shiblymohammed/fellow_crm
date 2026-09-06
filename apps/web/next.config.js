/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile the shared package from the monorepo
  transpilePackages: ['@fellow-crm/shared'],

  // Image domains for agency logos and uploads
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
