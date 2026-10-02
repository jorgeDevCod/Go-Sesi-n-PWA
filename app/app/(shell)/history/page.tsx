import type { Metadata } from "next";
import { auth } from "@/auth";
import { listSessionHistoryForUser } from "@/services/session/list-session-history.service";
import { computeSessionStats } from "@/features/history/session-stats";
import { SessionStatsView } from "@/features/history/components/SessionStatsView";
import { HistoryView } from "@/features/history/components/HistoryView";

export const metadata: Metadata = {
  title: "Historial",
};

export default async function HistoryPage() {
  const session = await auth();
  const userId = session!.user.id;

  const entries = await listSessionHistoryForUser(userId);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="font-display text-3xl font-bold text-foreground">Tu historial</h1>
      {entries.length > 0 && <SessionStatsView stats={computeSessionStats(entries)} />}
      <HistoryView entries={entries} />
    </div>
  );
}
