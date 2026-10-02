import { createHash, randomBytes } from "node:crypto";
import { Resend } from "resend";
import { findUserByEmail, updateUserPassword } from "@/repositories/user.repository";
import {
  findResetTokenByHash,
  markResetTokenUsed,
  replaceResetTokenForUser,
} from "@/repositories/password-reset.repository";
import { hashPassword } from "@/lib/password";
import { createRateLimiter } from "@/lib/rate-limit";
const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000;

/** Anti-spam del endpoint: 5 solicitudes / 10 min por correo. */
const resetLimiter = createRateLimiter({ maxAttempts: 5, windowMs: 10 * 60 * 1000 });

export class ResetRateLimitedError extends Error {
  constructor() {
    super("Demasiados intentos. Espera unos minutos e inténtalo de nuevo.");
    this.name = "ResetRateLimitedError";
  }
}

export class InvalidResetTokenError extends Error {
  constructor() {
    super("El enlace ya no es válido. Pide uno nuevo.");
    this.name = "InvalidResetTokenError";
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function resetUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/reset-password/${token}`;
}

async function sendResetEmail(to: string, url: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? "Go Sesión <onboarding@resend.dev>";
  await resend.emails.send({
    from,
    to,
    subject: "Recupera tu contraseña de Go Sesión",
    html: `<p>Hola,</p><p>Pide cambiar tu contraseña aquí (vale 1 hora, un solo uso):</p><p><a href="${url}">${url}</a></p><p>Si no fuiste tú, ignora este correo.</p>`,
  });
  return true;
}

/**
 * Siempre responde igual (exista o no la cuenta) para no enumerar emails.
 * Devuelve si se intentó enviar el correo (false sin API key o sin cuenta).
 */
export async function requestPasswordReset(
  email: string,
  now: Date = new Date(),
): Promise<{ emailed: boolean }> {
  if (!resetLimiter.check(`reset:${email.toLowerCase()}`).allowed) {
    throw new ResetRateLimitedError();
  }
  const user = await findUserByEmail(email);
  if (!user) return { emailed: false };
  const token = randomBytes(TOKEN_BYTES).toString("hex");
  await replaceResetTokenForUser(user.id, {
    tokenHash: hashToken(token),
    expiresAt: new Date(now.getTime() + TOKEN_TTL_MS),
  });
  const emailed = await sendResetEmail(user.email, resetUrl(token));
  return { emailed };
}

/** ¿El token está vigente y sin usar? (para pintar la página). */
export async function isResetTokenValid(token: string, now: Date = new Date()): Promise<boolean> {
  const row = await findResetTokenByHash(hashToken(token));
  return !!row && !row.usedAt && row.expiresAt.getTime() > now.getTime();
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
  now: Date = new Date(),
): Promise<void> {
  const row = await findResetTokenByHash(hashToken(token));
  if (!row || row.usedAt || row.expiresAt.getTime() <= now.getTime()) {
    throw new InvalidResetTokenError();
  }
  const passwordHash = await hashPassword(newPassword);
  // Orden seguro sin transacción distribuida: primero se gasta el enlace;
  // si fallara el update, el usuario pide otro (la contraseña vieja sigue válida).
  await markResetTokenUsed(row.id, now);
  await updateUserPassword(row.userId, passwordHash);
}
