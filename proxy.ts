import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { isPublicApiPath } from "@/lib/public-api-paths";

export { isPublicApiPath };

// Usa el contexto ligero de auth (Edge-safe) para no arrastrar bcrypt/Prisma
// al bundle del middleware.
export default NextAuth(authConfig).auth((req) => {
  // Auth.js debe ser público incluso sin sesión: `signin`, `callback`,
  // `session`, `csrf` y `providers` rompen si se redirigen a `/login`.
  if (isPublicApiPath(req.nextUrl.pathname)) return;
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/app/:path*", "/api/:path*"],
};
