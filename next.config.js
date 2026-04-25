/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '192.168.10.5'],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      }
    }
    return config
  },
}

module.exports = nextConfig