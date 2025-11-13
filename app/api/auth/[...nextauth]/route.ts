import NextAuth, { NextAuthOptions } from "next-auth";
import { CustomSession } from "@/lib/types";
import { client } from "@/lib/sanity_client";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { SanityAdapter, SanityCredentials } from "next-auth-sanity";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    SanityCredentials(client, "user"),
  ],
  session: {
    strategy: "jwt",
  },
  adapter: SanityAdapter(client, {
    schemas: {
      verificationToken: "verification-request",
      account: "account",
      user: "user",
    },
  }),
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT Callback - User:", user);
      if (user) {
        token.id = user.id;
      }
      console.log("JWT Callback - Token:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback - Session:", session);
      console.log("Session Callback - Token:", token);
      if (token && session.user) {
        (session as CustomSession).user.id = token.id as string;
      }
      console.log("Session Callback - Updated Session:", session);
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("SignIn Callback - User:", user);
      console.log("SignIn Callback - Account:", account);
      console.log("SignIn Callback - Profile:", profile);
      return true; // Return true to allow sign-in
    },
  },
  pages: {
    signIn:  "https://www.aura-controls.toil-labs.com/sign-in",
    error: "https://www.aura-controls.toil-labs.com/sign-in",
  },
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
