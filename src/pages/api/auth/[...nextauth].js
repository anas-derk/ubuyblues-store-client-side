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
        async signIn({ user }) {
            return "/";
        },
    },
    session: {
        strategy: "jwt",
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.secret,
    pages: {
        signIn: "/auth",
    }
});