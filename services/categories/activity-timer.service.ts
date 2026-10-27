import { Prisma } from "@/lib/generated/prisma/client";
import {
  findSubcategoryById,
  updateSubcategoryTimerPreference,
} from "@/repositories/subcategory.repository";
import {
  SubcategoryForbiddenError,
  SubcategoryNotFoundError,
} from "./subcategory.errors";
import type { PomodoroConfig } from "@/services/session/pomodoro";

type ActivityTimerPreferenceInput = {
  id: string;
  mode: "CLASSIC" | "POMODORO";
  classicMinutes?: number;
  pomodoroConfig?: PomodoroConfig | null;
};

/**
 * Persiste el último ajuste de tiempo de una actividad. Es la fuente de
 * verdad entre dispositivos; el cliente mantiene además una copia local para
 * que el cambio no se pierda si el usuario cierra antes de guardar.
 */
export async function saveActivityTimerPreferenceForUser(
  userId: string,
  input: ActivityTimerPreferenceInput,
) {
  const existing = await findSubcategoryById(input.id);
  if (!existing) throw new SubcategoryNotFoundError();
  if (existing.userId !== userId) throw new SubcategoryForbiddenError();

  const data: Prisma.SubcategoryUpdateInput = {
    lastMode: input.mode,
  };

  if (input.mode === "CLASSIC" && input.classicMinutes !== undefined) {
    data.lastClassicMinutes = input.classicMinutes;
  }

  if (input.mode === "POMODORO" && input.pomodoroConfig) {
    data.pomodoroConfig = input.pomodoroConfig as unknown as Prisma.InputJsonValue;
  }

  return updateSubcategoryTimerPreference(input.id, data);
}
