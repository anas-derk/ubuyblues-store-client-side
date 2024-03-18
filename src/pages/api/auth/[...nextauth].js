import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { randomBytes } from 'crypto';

export default NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            console.log(user);
            return "/";
        }
    },
    secret: randomBytes(32).toString('hex'),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth",
        signOut: "/",
    },
});