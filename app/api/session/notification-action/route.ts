import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getActiveSessionForUser } from "@/services/session/get-active-session.service";
import { interruptSessionForUser } from "@/services/session/interrupt-session.service";
import { rewindPomodoroPhaseForUser } from "@/services/session/rewind-pomodoro-phase.service";
import { skipPomodoroPhaseForUser } from "@/services/session/skip-pomodoro-phase.service";

export const dynamic = "force-dynamic";

type NotificationAction = "finish" | "skip" | "previous";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: { id?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : null;
  const action = body.action as NotificationAction | undefined;
  if (!id || !action || !["finish", "skip", "previous"].includes(action)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const active = await getActiveSessionForUser(userId);
  if (!active || active.id !== id) {
    return NextResponse.json({ error: "No hay una sesión activa." }, { status: 404 });
  }

  try {
    if (action === "finish") {
      const finished = await interruptSessionForUser(id, userId);
      return NextResponse.json({ ok: true, status: finished.status });
    }

    const updated =
      action === "skip"
        ? await skipPomodoroPhaseForUser(id, userId)
        : await rewindPomodoroPhaseForUser(id, userId);

    return NextResponse.json({ ok: true, status: updated.status });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar la sesión." }, { status: 500 });
  }
}
