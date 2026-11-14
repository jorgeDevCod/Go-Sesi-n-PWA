-- Saltos de fases Pomodoro y marcas de notificación.
ALTER TABLE "focus_sessions"
  ADD COLUMN "skippedFocusMs" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "skippedBreakMs" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastNotifiedPhaseKey" TEXT,
  ADD COLUMN "completionNotifiedAt" TIMESTAMP(3);

-- Recordatorios por actividad del plan diario.
ALTER TABLE "plan_items"
  ADD COLUMN "remindAt" TEXT,
  ADD COLUMN "reminderSentAt" TIMESTAMP(3);

ALTER TABLE "daily_plans"
  ADD COLUMN "timeZone" TEXT;
