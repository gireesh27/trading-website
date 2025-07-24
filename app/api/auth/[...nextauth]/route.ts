// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";

import { connectToDatabase } from "@/lib/Database/mongodb";
import { User, IUser } from "@/lib/Database/Models/User";
import bcrypt from "bcryptjs";
import type { User as NextAuthUser } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      // version: "2.0",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();

        const { email, password } = credentials ?? {};

        if (!email || !password) return null;

        const user = await User.findOne({ email });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) { // Add 'account' to the arguments
      await connectToDatabase();

      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        if (!user.email) {
          console.error(
            "OAuth provider did not return an email for the user. Cannot create user without email."
          );
          return false;
        }

        await User.create({
          name: user.name || "Unnamed",
          email: user.email,
          isOAuth: account?.provider !== 'credentials', // Check if the provider is not 'credentials'
          isVerified: true,
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      if (token?.id && session.user) {
        (session.user as any).id = token.id?.toString(); // Make sure to cast to any to avoid type errors
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };