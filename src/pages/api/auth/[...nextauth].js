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
    secret: randomBytes(32).toString('hex'),
});