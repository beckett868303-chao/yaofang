/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', '192.168.10.5'],
    unoptimized: true,
  },
}

module.exports = nextConfig