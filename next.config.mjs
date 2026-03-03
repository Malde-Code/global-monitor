/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export',
    basePath: '/global-monitor',
    images: {
        unoptimized: true,
    },
    transpilePackages: ['deck.gl', '@deck.gl/core', '@deck.gl/layers', '@deck.gl/mapbox', '@deck.gl/react'],
};

export default nextConfig;
