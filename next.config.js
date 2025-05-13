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
        USER_TOKEN_NAME_IN_LOCAL_STORAGE: "ub-s-u-t",
        STORE_NAME: "Ubuyblues Store",
        USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE: "ubuyblues-store-language",
        USER_ADDRESSES_FIELD_NAME_IN_LOCAL_STORAGE: "ubuyblues-customer-addresses",
        USER_CART_NAME_IN_LOCAL_STORAGE: "ubuyblues-store-customer-cart",
        USER_THEME_MODE_FIELD_NAME_IN_LOCAL_STORAGE: "ubuyblues-store-light-mode",
        REFERAL_WRITER_FIELD_NAME_IN_LOCAL_STORAGE: "ubuyblue-store-referal-writer-info",
        SELECTED_COUNTRY_BY_USER: "ubuyblues-store-country",
        CONTACT_NUMBER: "96560048235",
        CONTACT_EMAIL: "info@ubuyblues.com",
        FACEBOOK_LINK: "https://www.facebook.com/share/1DsaNmAm5Q",
        INSTAGRAM_LINK: "https://www.instagram.com/ubuyblues",
        X_LINK: "https://x.com/ubuyblues",
        TIKTOK_LINK: "https://www.tiktok.com/@ubuyblues",
        WEBSITE_NAME: "Ubuyblues",
        WEBSITE_DASHBOARD_URL: process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://dashboard.ubuyblues.com",
        MAIN_COLOR_ONE: "#6A017A"
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