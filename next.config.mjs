/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
        protocol: 'https',
      },
      {
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
        protocol: 'https',
      },
      {
        hostname: 'github.githubassets.com',
        pathname: '/**',
        protocol: 'https',
      },
      {
        hostname: 'images.unsplash.com',
        pathname: '/**',
        protocol: 'https',
      },
      {
        hostname: '*.digitaloceanspaces.com',
        pathname: '/**',
        protocol: 'https',
      },
      {
        hostname: 't4.ftcdn.net',
        pathname: '/**',
        protocol: 'https',
      },
      {
        hostname: '*.googleusercontent.com',
        pathname: '/**',
        protocol: 'https',
      },
      {
        hostname: 'graph.facebook.com',
        pathname: '/**',
        protocol: 'https',
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  output: 'standalone',
  reactStrictMode: true,
  trailingSlash: false,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
