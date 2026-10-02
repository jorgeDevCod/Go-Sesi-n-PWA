-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('CLASSIC', 'POMODORO');

-- AlterTable
ALTER TABLE "focus_sessions" ADD COLUMN "mode" "SessionMode" NOT NULL DEFAULT 'CLASSIC';

-- AlterTable
ALTER TABLE "focus_sessions" ADD COLUMN "pomodoroConfig" JSONB;
