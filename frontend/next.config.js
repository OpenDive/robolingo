/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    // Expose environment variables for Walrus integration
    WALRUS_PUBLISHER: process.env.WALRUS_PUBLISHER,
    WALRUS_AGGREGATOR: process.env.WALRUS_AGGREGATOR,
    WALRUS_WALLET_ADDRESS: process.env.WALRUS_WALLET_ADDRESS,
    WALRUS_PRIVATE_KEY: process.env.WALRUS_PRIVATE_KEY,
    ATOMA_API_KEY: process.env.ATOMA_API_KEY,
  },
}

module.exports = nextConfig