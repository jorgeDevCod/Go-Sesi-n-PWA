-- Tiempo de fase descontado al retroceder de fase en Pomodoro.
ALTER TABLE "focus_sessions"
  ADD COLUMN "rewoundMs" INTEGER NOT NULL DEFAULT 0;
