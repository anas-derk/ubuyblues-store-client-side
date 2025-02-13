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
        userTokenNameInLocalStorage: "ub-s-u-t",
        storeName: "Ubuyblues Store",
        userlanguageFieldNameInLocalStorage: "ubuyblues-store-language",
        userAddressesFieldNameInLocalStorage: "ubuyblues-customer-addresses",
        userCartNameInLocalStorage: "ubuyblues-store-customer-cart",
        userThemeModeFieldNameInLocalStorage: "ubuyblues-store-light-mode",
        referalWriterFieldNameInLocalStorage: "ubuyblue-store-referal-writer-info",
        selectedCountryByUser: "ubuyblues-store-country",
        contactNumber: "96560048235",
        contactEmail: "info@ubuyblues.com"
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