import { getServerSession } from "next-auth/next";

export function getSession() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set. Check your .env file.");
  }
  return getServerSession({
    providers: [],
    secret
  });
}
