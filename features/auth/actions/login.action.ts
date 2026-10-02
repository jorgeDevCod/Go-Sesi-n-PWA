"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { loginLimiter } from "@/lib/rate-limit";
import { signIn } from "@/auth";

export type LoginActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Rate limit por IP: solo los fallos consumen intentos (5 fallos / 10 min).
  // El pre-check no consume para no castigar logins legítimos tras errores.
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
    (await headers()).get("x-real-ip")?.trim() ||
    "unknown";
  const rateKey = `login:${ip}`;
  if (!loginLimiter.isBlocked(rateKey).allowed) {
    return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/app/home",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (!loginLimiter.check(rateKey).allowed) {
        return { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
      }
      return { error: "Correo o contraseña incorrectos." };
    }
    throw error;
  }

  return {};
}
