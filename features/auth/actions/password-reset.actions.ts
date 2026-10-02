"use server";

import { z } from "zod";
import { resetPasswordSchema } from "@/features/auth/schemas/auth.schema";
import {
  isResetTokenValid,
  requestPasswordReset,
  resetPasswordWithToken,
} from "@/services/auth/password-reset.service";

const GENERIC_MESSAGE = "Si existe una cuenta con ese correo, enviamos un enlace.";

export async function requestPasswordResetAction(email: unknown) {
  const parsed = z.email("Ingresa un correo válido.").safeParse(email);
  if (!parsed.success) {
    return { success: false as const, error: "Ingresa un correo válido." };
  }
  try {
    await requestPasswordReset(parsed.data);
  } catch (error) {
    // Anti-enumeración: el único error visible distinto es el rate-limit.
    if (error instanceof Error && error.name === "ResetRateLimitedError") {
      return { success: false as const, error: error.message };
    }
    return { success: true as const, message: GENERIC_MESSAGE };
  }
  return { success: true as const, message: GENERIC_MESSAGE };
}

export async function checkResetTokenAction(token: unknown) {
  if (typeof token !== "string" || token.length === 0) {
    return { success: true as const, valid: false };
  }
  try {
    const valid = await isResetTokenValid(token);
    return { success: true as const, valid };
  } catch {
    return { success: true as const, valid: false };
  }
}

export async function resetPasswordAction(input: unknown) {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false as const,
      error: issue?.message ?? "Datos inválidos.",
      fieldErrors,
    };
  }
  try {
    await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
    };
  }
}
