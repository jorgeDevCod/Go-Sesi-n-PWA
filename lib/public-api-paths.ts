/**
 * Rutas de Auth.js que deben ser públicas incluso sin sesión: `signin`,
 * `callback`, `session`, `csrf` y `providers` rompen si el middleware los
 * redirige a `/login`. Módulo puro (sin imports de Next/Prisma) para poder
 * testearlo con Vitest; `proxy.ts` lo reutiliza.
 */
export function isPublicApiPath(pathname: string): boolean {
  return pathname === "/api/auth" || pathname.startsWith("/api/auth/");
}
