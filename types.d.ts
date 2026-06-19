// Global type declarations for guestlist-platform

declare namespace NodeJS {
  interface ProcessEnv {
    NEXTAUTH_SECRET?: string;
    DATABASE_URL?: string;
  }
}

declare module '*.css' {
  const classes: Record<string, string>;
  export default classes;
}

// NextAuth types
interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

type Session = {
  user?: SessionUser;
};

declare function getSession(): Promise<Session | null>;
export { getSession };