import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "./lib/prism";

/**
 * Module augmentation for Auth.js v5 types.
 * Extends the default Session and JWT types to include our custom fields.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "STAFF";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "STAFF";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "STAFF";
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.adminUser.findFirst({
          where: { email: credentials?.email as string }
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials?.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name || undefined,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  pages: {
    signIn: "/admin/login",
    error: "/auth/error"
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60 // 1 day
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    }
  }
};

const NextAuthResult = NextAuth(authOptions);

/**
 * Auth.js v5 primary function.
 * Use in getServerSideProps: await auth(context)
 * Use in API routes: await auth(req, res)
 */
export const auth = NextAuthResult.auth;

/**
 * Next.js App Router handlers (GET/POST for /api/auth/[...nextauth])
 */
export const handlers = NextAuthResult.handlers;

/**
 * Backward-compatible getServerSession wrapper for pages router.
 * Drop-in replacement for getServerSession(req, res, authOptions).
 */
export async function getServerSession(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuthResult.auth(req, res);
}

export default NextAuthResult;
