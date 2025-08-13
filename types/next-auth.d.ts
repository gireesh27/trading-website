import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      walletBalance: any;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id: string; // ✅ Custom property
    };
  }

  interface JWT {
    id: string; // ✅ So we can assign to session
  }
}
