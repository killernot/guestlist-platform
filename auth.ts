import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./lib/prism";

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
          where: { email: credentials.email as string }
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return { id: user.id, name: user.name || undefined };
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token && typeof token === "object") {
        const t = token as any;
        session.user.id = t.id;
      }
      return session;
    }
  }
};

export default NextAuth(authOptions);