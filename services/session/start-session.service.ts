import { Prisma } from "@/lib/generated/prisma/client";
import {
  createSession,
  findActiveByUserId,
} from "@/repositories/focus-session.repository";
import { findSubcategoryById } from "@/repositories/subcategory.repository";
import { SubcategoryNotOwnedError } from "./session.errors";
import { toSessionDTO } from "./session.dto";
import type { PomodoroConfig } from "./pomodoro";

type SessionMode = "CLASSIC" | "POMODORO";

type StartSessionInput = {
  userId: string;
  subcategoryId: string;
  plannedMinutes: number;
  mode?: SessionMode;
  pomodoroConfig?: PomodoroConfig | null;
};

export class InvalidPomodoroConfigError extends Error {
  constructor() {
    super("El modo pomodoro requiere configuración.");
    this.name = "InvalidPomodoroConfigError";
  }
}

function resolvePomodoroConfig(
  mode: SessionMode,
  pomodoroConfig?: PomodoroConfig | null,
): PomodoroConfig | null {
  if (mode === "CLASSIC") return null;
  if (
    !pomodoroConfig ||
    !Number.isInteger(pomodoroConfig.focusMin) ||
    pomodoroConfig.focusMin < 5 ||
    pomodoroConfig.focusMin > 180 ||
    !Number.isInteger(pomodoroConfig.breakMin) ||
    pomodoroConfig.breakMin < 1 ||
    pomodoroConfig.breakMin > 60 ||
    !Number.isInteger(pomodoroConfig.cycles) ||
    pomodoroConfig.cycles < 1 ||
    pomodoroConfig.cycles > 12 ||
    typeof pomodoroConfig.autoStart !== "boolean"
  ) {
    throw new InvalidPomodoroConfigError();
  }
  return pomodoroConfig;
}

export async function startSessionForUser({
  userId,
  subcategoryId,
  plannedMinutes,
  mode = "CLASSIC",
  pomodoroConfig = null,
}: StartSessionInput) {
  const existing = await findActiveByUserId(userId);
  if (existing) {
    return { session: toSessionDTO(existing), reused: true as const };
  }

  const subcategory = await findSubcategoryById(subcategoryId);
  if (!subcategory || subcategory.userId !== userId) {
    throw new SubcategoryNotOwnedError();
  }

  const resolvedConfig = resolvePomodoroConfig(mode, pomodoroConfig);

  try {
    const created = await createSession({
      plannedMinutes,
      mode,
      pomodoroConfig: resolvedConfig ?? undefined,
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
