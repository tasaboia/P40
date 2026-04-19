const withNextIntl = require("next-intl/plugin")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jqfcw1rj6eeoef9q.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
