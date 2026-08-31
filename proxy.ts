import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Usa el contexto ligero de auth (Edge-safe) para no arrastrar bcrypt/Prisma
// al bundle del middleware.
export default NextAuth(authConfig).auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/app/:path*", "/api/:path*"],
};
