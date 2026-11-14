import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getActiveSessionForUser } from "@/services/session/get-active-session.service";
import { completeSessionForUser } from "@/services/session/complete-session.service";
import { isSessionExpired } from "@/services/session/session-expiry";
import { SessionExperience } from "@/features/session/components/SessionExperience";
import { ROUTES } from "@/lib/routes";

export default async function SessionPage() {
  const session = await auth();
  const userId = session!.user.id;

  const activeSession = await getActiveSessionForUser(userId);
  if (!activeSession) {
    redirect(ROUTES.home);
  }

  if (isSessionExpired(activeSession)) {
    await completeSessionForUser(activeSession.id, userId);
    redirect(ROUTES.sessionFinished(activeSession.id));
  }

  return <SessionExperience initialSession={activeSession} />;
}
