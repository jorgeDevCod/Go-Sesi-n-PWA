"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  getPreferencesForUser,
  savePreferencesForUser,
} from "@/services/preferences/user-preferences.service";
import { getTodayMoodForUser, saveTodayMoodForUser } from "@/services/mood/daily-mood.service";

const energySchema = z.enum(["baja", "media", "alta"]);

const savePrefsSchema = z.object({
  energy: energySchema.nullable().optional(),
  preferredMinutes: z.number().int().positive().nullable().optional(),
  dontAskAgain: z.boolean().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado.");
  }
  return session.user.id;
}

function toErrorResult(error: unknown) {
  return {
    success: false as const,
    error: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
  };
}

export async function getPreferencesAction() {
  try {
    const prefs = await getPreferencesForUser(await requireUserId());
    return { success: true as const, prefs };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function savePreferencesAction(input: unknown) {
  const parsed = savePrefsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Preferencias inválidas." };
  }
  try {
    await savePreferencesForUser(await requireUserId(), parsed.data);
    return { success: true as const };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function getTodayMoodAction() {
  try {
    const energy = await getTodayMoodForUser(await requireUserId());
    return { success: true as const, energy };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function saveMoodAction(input: unknown) {
  const parsed = energySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Energía inválida." };
  }
  try {
    await saveTodayMoodForUser(await requireUserId(), parsed.data);
    return { success: true as const };
  } catch (error) {
    return toErrorResult(error);
  }
}
