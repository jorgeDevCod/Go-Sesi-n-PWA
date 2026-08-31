import type { NextAuthConfig } from "next-auth";

/**
 * Configuración de NextAuth compatible con Edge Runtime.
 *
 * Este archivo NO debe importar bcryptjs, Prisma ni ningún módulo Node-only:
 * lo usan `proxy.ts` (middleware, corre en Edge en Vercel) y `auth.ts`.
 * El provider `Credentials` con su `authorize` (que sí usa bcrypt + Prisma)
 * se añade únicamente en `auth.ts`, ya que solo se ejecuta en Server Actions
 * (runtime Node).
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
