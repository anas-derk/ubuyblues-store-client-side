/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
    env: {
        BASE_API_URL: process.env.NODE_ENV === "development" ? "http://localhost:5200" : "https://api.ubuyblues.com",
        WEBSITE_URL: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://ubuyblues.com",
        userTokenNameInLocalStorage: "as-s-u-t",
        GOOGLE_CLIENT_ID: "665697657851-ajm9qfeko4lcero0hj8jh7eqvds9eg18.apps.googleusercontent.com",
        GOOGLE_CLIENT_SECRET: "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"
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