/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "development",
  },
  env: {
    BASE_API_URL: process.env.NODE_ENV === "development" ? "http://localhost:5200" : "https://api.ubuyblues.com",
    WEBSITE_URL: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://ubuyblues.com",
  },
  async headers() {
    return [
      {
        source: process.env.NODE_ENV === "development" ? "//localhost:5200/(.*)" : "//api.ubuyblues.com/(.*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://ubuyblues.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ]
      }
    ];
  }
}

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

module.exports = withPWA(nextConfig);