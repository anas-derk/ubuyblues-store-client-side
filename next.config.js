/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    BASE_API_URL: process.env.NODE_ENV === "development" ? "http://localhost:5200" : "https://api.ubuyblues.com",
    WEBSITE_URL: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://api.ubuyblues.com",
    GOOGLE_CLIENT_ID: "817318940780-is4da323qtglofv52o6lnbr6e57ic6vv.apps.googleusercontent.com",
    GOOGLE_CLIENT_SECRET: "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",
    NEXTAUTH_URL: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://ubuyblues.com",
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

module.exports = nextConfig;