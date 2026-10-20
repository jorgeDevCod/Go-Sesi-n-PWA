import { Prisma } from "@/lib/generated/prisma/client";
import {
  findSubcategoryById,
  updateSubcategoryPomodoroConfig,
} from "@/repositories/subcategory.repository";
import {
  SubcategoryForbiddenError,
  SubcategoryNotFoundError,
} from "./subcategory.errors";
import { parsePomodoroConfig, type PomodoroConfig } from "@/services/session/pomodoro";

export { parsePomodoroConfig as parseActivityPomodoroConfig };

/**
 * Guarda (o limpia con null) el cronómetro pomodoro de una actividad
 * propia. Es el valor por defecto al iniciar esa actividad en modo Pomodoro.
 */
export async function setActivityPomodoroForUser(
  userId: string,
  id: string,
  pomodoroConfig: PomodoroConfig | null,
) {
  const existing = await findSubcategoryById(id);
  if (!existing) throw new SubcategoryNotFoundError();
  if (existing.userId !== userId) throw new SubcategoryForbiddenError();
  return updateSubcategoryPomodoroConfig(
    id,
    pomodoroConfig === null
      ? Prisma.JsonNull
      : (pomodoroConfig as unknown as Prisma.InputJsonValue),
  );
}
