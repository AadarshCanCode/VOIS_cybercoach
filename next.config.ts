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
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
            {
                source: '/proxy/:path*',
                destination: `${backendUrl}/proxy/:path*`,
            },
            {
                source: '/proctor-logs/:path*',
                destination: `${backendUrl}/proctor-logs/:path*`,
            },
            {
                source: '/test-models/:path*',
                destination: `${backendUrl}/test-models/:path*`,
            },
        ];
    },
};

export default nextConfig;
