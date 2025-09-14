/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client'],
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
  },
  images: {
    domains: ['localhost', 'your-domain.com']
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: false
      }
    ]
  }
}

module.exports = nextConfig
