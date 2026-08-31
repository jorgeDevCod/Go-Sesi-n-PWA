"use server";

import { auth } from "@/auth";
import {
  extendSessionSchema,
  sessionIdSchema,
  startSessionSchema,
} from "@/features/session/schemas/session.schema";
import { startSessionForUser } from "@/services/session/start-session.service";
import { pauseSessionForUser } from "@/services/session/pause-session.service";
import { resumeSessionForUser } from "@/services/session/resume-session.service";
import { completeSessionForUser } from "@/services/session/complete-session.service";
import { interruptSessionForUser } from "@/services/session/interrupt-session.service";
import { extendSessionForUser } from "@/services/session/extend-session.service";
import { getActiveSessionForUser } from "@/services/session/get-active-session.service";
import { deleteSessionHistoryForUser } from "@/services/session/delete-session-history.service";
import type { SessionDTO } from "@/services/session/session.dto";

export type SessionActionResult =
  | { success: true; session: SessionDTO; reused?: boolean }
  | { success: false; error: string };

export type ActiveSessionActionResult =
  | { success: true; session: SessionDTO | null }
  | { success: false; error: string };

export type DeleteHistoryActionResult = { success: true } | { success: false; error: string };

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado.");
  }
  return session.user.id;
}

function toErrorResult(error: unknown): SessionActionResult {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
  };
}

export async function startSessionAction(input: unknown): Promise<SessionActionResult> {
  const parsed = startSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const userId = await requireUserId();
    const { session, reused } = await startSessionForUser({ userId, ...parsed.data });
    return { success: true, session, reused };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function pauseSessionAction(input: unknown): Promise<SessionActionResult> {
  const parsed = sessionIdSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };

  try {
    const userId = await requireUserId();
    const session = await pauseSessionForUser(parsed.data.id, userId);
    return { success: true, session };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function resumeSessionAction(input: unknown): Promise<SessionActionResult> {
  const parsed = sessionIdSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };

  try {
    const userId = await requireUserId();
    const session = await resumeSessionForUser(parsed.data.id, userId);
    return { success: true, session };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function completeSessionAction(input: unknown): Promise<SessionActionResult> {
  const parsed = sessionIdSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };

  try {
    const userId = await requireUserId();
    const session = await completeSessionForUser(parsed.data.id, userId);
    return { success: true, session };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function interruptSessionAction(input: unknown): Promise<SessionActionResult> {
  const parsed = sessionIdSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };

  try {
    const userId = await requireUserId();
    const session = await interruptSessionForUser(parsed.data.id, userId);
    return { success: true, session };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function extendSessionAction(input: unknown): Promise<SessionActionResult> {
  const parsed = extendSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const userId = await requireUserId();
    const session = await extendSessionForUser(
      parsed.data.id,
      userId,
      parsed.data.extraMinutes,
    );
    return { success: true, session };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function deleteSessionHistoryAction(
  input: unknown,
): Promise<DeleteHistoryActionResult> {
  const parsed = sessionIdSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };

  try {
    const userId = await requireUserId();
    await deleteSessionHistoryForUser(parsed.data.id, userId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
    };
  }
}

export async function getActiveSessionAction(): Promise<ActiveSessionActionResult> {
  try {
    const userId = await requireUserId();
    const session = await getActiveSessionForUser(userId);
    return { success: true, session };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
    };
  }
}
