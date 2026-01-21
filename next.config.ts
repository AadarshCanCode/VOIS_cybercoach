import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'drive.google.com',
            },
            {
                protocol: 'https',
                hostname: 'plus.unsplash.com',
            }
        ],
    },
    // Proxies for backend
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:4000/api/:path*',
            },
            {
                source: '/proxy/:path*',
                destination: 'http://localhost:4000/proxy/:path*',
            },
            {
                source: '/proctor-logs/:path*',
                destination: 'http://localhost:4000/proctor-logs/:path*',
            },
            {
                source: '/test-models/:path*',
                destination: 'http://localhost:4000/test-models/:path*',
            },
        ];
    },
};

export default nextConfig;
