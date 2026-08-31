import type { Metadata } from "next";
import { auth } from "@/auth";
import { listSessionHistoryForUser } from "@/services/session/list-session-history.service";
import { HistoryView } from "@/features/history/components/HistoryView";

export const metadata: Metadata = {
  title: "Historial",
};

export default async function HistoryPage() {
  const session = await auth();
  const userId = session!.user.id;

  const entries = await listSessionHistoryForUser(userId);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-display mb-6 text-3xl font-bold text-foreground">Tu historial</h1>
      <HistoryView entries={entries} />
    </div>
  );
}
