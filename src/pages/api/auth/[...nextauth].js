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
        async signIn() {
            return "/";
        },
        async session({ session }){
            return session;
        },
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: randomBytes(32).toString('hex'),
    pages: {
        signIn: "/auth",
        newUser: "/auth",
    },
});