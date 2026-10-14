/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
  async rewrites() {
    const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const backendOrigin = rawApi.startsWith('http')
      ? rawApi.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';

    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: '/auth/:path*',
        destination: `${backendOrigin}/api/auth/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;


