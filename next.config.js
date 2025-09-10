/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Pour dev local simple
    domains: ['164.160.40.182', '164.160.40.182'], 
    
    // Si tu veux utiliser remotePatterns pour plus de contrôle
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '164.160.40.182', // chaîne unique, pas de tableau
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '164.160.40.182', // chaîne unique
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL, // reste ton API URL
  },
}

module.exports = nextConfig;
