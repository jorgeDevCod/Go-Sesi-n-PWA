import { Prisma } from "@/lib/generated/prisma/client";
import {
  createSession,
  findActiveByUserId,
} from "@/repositories/focus-session.repository";
import { findSubcategoryById } from "@/repositories/subcategory.repository";
import { SubcategoryNotOwnedError } from "./session.errors";
import { toSessionDTO } from "./session.dto";

type StartSessionInput = {
  userId: string;
  subcategoryId: string;
  plannedMinutes: number;
};

export async function startSessionForUser({
  userId,
  subcategoryId,
  plannedMinutes,
}: StartSessionInput) {
  const existing = await findActiveByUserId(userId);
  if (existing) {
    return { session: toSessionDTO(existing), reused: true as const };
  }

  const subcategory = await findSubcategoryById(subcategoryId);
  if (!subcategory || subcategory.userId !== userId) {
    throw new SubcategoryNotOwnedError();
  }

  try {
    const created = await createSession({
      plannedMinutes,
      activeUserId: userId,
      subcategory: { connect: { id: subcategoryId } },
      user: { connect: { id: userId } },
    });
    return { session: toSessionDTO(created), reused: false as const };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const race = await findActiveByUserId(userId);
      if (race) {
        return { session: toSessionDTO(race), reused: true as const };
      }
    }
    throw error;
  }
}
