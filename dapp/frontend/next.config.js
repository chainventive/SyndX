/** @type {import('next').NextConfig} */

const nextConfig = {
    // required for docker support
    output: 'standalone',
    webpack: (config) => {
        config.externals.push("pino-pretty");
        return config;
    },
}

module.exports = nextConfig
