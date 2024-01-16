/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    BASE_API_URL: process.env.NODE_ENV === "development" ? "http://localhost:5200" : "https://api.ubuyblues.com",
    WEBSITE_URL: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://api.ubuyblues.com",
    GOOGLE_CLIENT_ID: process.env.NODE_ENV === "development" ? "817318940780-8drpve7i3kcado5llc1t86cbi3d1493s.apps.googleusercontent.com" : "817318940780-uphb56qbks4u8v9i41gdlqa2ff136mqq.apps.googleusercontent.com",
    GOOGLE_CLIENT_SECRET: process.env.NODE_ENV === "development" ? "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" : "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",
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