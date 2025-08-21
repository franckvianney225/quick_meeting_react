/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Pour dev local simple
    domains: ['localhost', '164.160.40.182'], 
    
    // Si tu veux utiliser remotePatterns pour plus de contrôle
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost', // chaîne unique, pas de tableau
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost', // chaîne unique
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
