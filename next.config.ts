const withNextIntl = require("next-intl/plugin")();

const ALLOWED_ORIGIN = "https://40dias.zionchurch.org.br";

const corsHeaders = [
  { key: "Access-Control-Allow-Origin", value: ALLOWED_ORIGIN },
  { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
  {
    key: "Access-Control-Allow-Headers",
    value: "X-Requested-With, Content-Type, Authorization, Accept",
  },
  { key: "Access-Control-Allow-Credentials", value: "true" },
];

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

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: corsHeaders,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
