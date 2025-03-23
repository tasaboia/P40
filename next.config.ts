const withNextIntl = require("next-intl/plugin")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...withNextIntl(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "https://jqfcw1rj6eeoef9q.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
};

module.exports = nextConfig;
