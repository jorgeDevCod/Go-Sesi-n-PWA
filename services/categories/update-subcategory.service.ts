import { Prisma } from "@/lib/generated/prisma/client";
import {
  findSubcategoryById,
  updateSubcategory,
} from "@/repositories/subcategory.repository";
import {
  DuplicateSubcategoryNameError,
  SubcategoryForbiddenError,
  SubcategoryNotFoundError,
} from "./subcategory.errors";
import type { Complexity } from "@/lib/constants/default-subcategories";
import type { PomodoroConfig } from "@/services/session/pomodoro";

type UpdateSubcategoryInput = {
  id: string;
  userId: string;
  name?: string;
  icon?: string;
  color?: string;
  complexity?: Complexity;
  pomodoroConfig?: PomodoroConfig | null;
};

export async function updateSubcategoryForUser({
  id,
  userId,
  pomodoroConfig,
  ...data
}: UpdateSubcategoryInput) {
  const existing = await findSubcategoryById(id);
  if (!existing) throw new SubcategoryNotFoundError();
  if (existing.userId !== userId) throw new SubcategoryForbiddenError();

  const payload: Prisma.SubcategoryUpdateInput = { ...data };
  if (pomodoroConfig !== undefined) {
    payload.pomodoroConfig =
      pomodoroConfig === null
        ? Prisma.JsonNull
        : (pomodoroConfig as unknown as Prisma.InputJsonValue);
  }

  try {
    return await updateSubcategory(id, payload);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicateSubcategoryNameError();
    }
    throw error;
  }
}
