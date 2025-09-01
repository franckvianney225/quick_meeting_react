/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Pour dev local simple
    domains: ['192.168.1.77', '192.168.1.77'], 
    
    // Si tu veux utiliser remotePatterns pour plus de contrôle
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.1.77', // chaîne unique, pas de tableau
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.77', // chaîne unique
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
