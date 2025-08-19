// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { connectToDatabase } from "@/lib/Database/mongodb";
import { User } from "@/lib/Database/Models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();
        const { email, password } = credentials ?? {};
        if (!email || !password) return null;

        const user = await User.findOne({ email });
        if (!user || !user.emailPasswordHash) return null;

        const isValid = await bcrypt.compare(password, user.emailPasswordHash);
        if (!isValid) return null;

        // Initialize walletBalance if undefined
        if (user.walletBalance === undefined) {
          user.walletBalance = 1000;
          await user.save();
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          walletBalance: user.walletBalance,
          walletPasswordHash: user.walletPasswordHash ?? null,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account }) {
      await connectToDatabase();

      if (user) {
        let dbUser = await User.findOne({ email: user.email });

        // If not found, create new OAuth user in DB
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            isOAuth: true,
            walletBalance: 1000,
          });
        }

        token.id = dbUser._id.toString();
        token.walletBalance = dbUser.walletBalance ?? 0;
        token.walletPasswordHash = dbUser.walletPasswordHash ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // Always valid ObjectId now
        session.user.walletBalance = token.walletBalance as number;
        session.user.walletPasswordHash = token.walletPasswordHash as string | null;
      }
      return session;
    },
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
