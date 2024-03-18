import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export default NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user, credentials, account }) {
            console.log(account)
            return "/";
        },
        
    },
    session: {
        strategy: "jwt",
    },
    cookies: {
        sessionToken: {
            name: "asfour-store-user-token",
        }
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.secret,
    pages: {
        signIn: "/auth",
    }
});