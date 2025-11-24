/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'produits.bienmanger.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.jimcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bulles-champenoises.fr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.vinetik-alsace.fr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
