-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'INTERRUPTED');

-- CreateTable
CREATE TABLE "focus_sessions" (
    "id" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "plannedMinutes" INTEGER NOT NULL,
    "actualMinutes" INTEGER,
    "pausedMs" INTEGER NOT NULL DEFAULT 0,
    "pausedAt" TIMESTAMP(3),
    "extendedCount" INTEGER NOT NULL DEFAULT 0,
    "energyLevel" TEXT,
    "comment" TEXT,
    "activeUserId" TEXT,
    "subcategoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "focus_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "focus_sessions_activeUserId_key" ON "focus_sessions"("activeUserId");

-- CreateIndex
CREATE INDEX "focus_sessions_userId_status_idx" ON "focus_sessions"("userId", "status");

-- CreateIndex
CREATE INDEX "focus_sessions_userId_startedAt_idx" ON "focus_sessions"("userId", "startedAt");

-- AddForeignKey
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
