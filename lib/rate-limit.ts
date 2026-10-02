/**
 * Rate limiter en memoria (ventana fija por clave). Módulo puro, sin
 * imports de Next/Prisma, para poder testearlo con Vitest.
 *
 * Límite conocido: en serverless multi-instancia (Vercel) cada instancia
 * lleva su propio conteo. Mitiga fuerza bruta oportunista, no distribuida;
 * para eso hará falta un store compartido (KV/Redis) en una fase posterior.
 */
export type RateLimitResult = {
  allowed: boolean;
  /** Segundos a esperar cuando `allowed` es false. */
  retryAfterSec?: number;
};

export function createRateLimiter(options: {
  maxAttempts: number;
  windowMs: number;
  now?: () => number;
}) {
  const { maxAttempts, windowMs, now = () => Date.now() } = options;
  const hits = new Map<string, { count: number; windowStart: number }>();

  function check(key: string): RateLimitResult {
    const at = now();
    const entry = hits.get(key);
    if (!entry || at - entry.windowStart >= windowMs) {
      hits.set(key, { count: 1, windowStart: at });
      return { allowed: true };
    }
    entry.count += 1;
    if (entry.count > maxAttempts) {
      const retryAfterSec = Math.ceil((entry.windowStart + windowMs - at) / 1000);
      return { allowed: false, retryAfterSec: Math.max(retryAfterSec, 1) };
    }
    return { allowed: true };
  }

  /**
   * Lectura sin consumir intento: para el pre-check antes de una operación
   * costosa (bcrypt). Solo los fallos reales consumen intentos vía `check`.
   */
  function isBlocked(key: string): RateLimitResult {
    const at = now();
    const entry = hits.get(key);
    if (!entry || at - entry.windowStart >= windowMs) return { allowed: true };
    if (entry.count > maxAttempts) {
      const retryAfterSec = Math.ceil((entry.windowStart + windowMs - at) / 1000);
      return { allowed: false, retryAfterSec: Math.max(retryAfterSec, 1) };
    }
    return { allowed: true };
  }

  function reset(key: string) {
    hits.delete(key);
  }

  return { check, isBlocked, reset };
}

/** Política de login: 5 intentos fallidos / 10 min por IP. */
export const loginLimiter = createRateLimiter({ maxAttempts: 5, windowMs: 10 * 60 * 1000 });
