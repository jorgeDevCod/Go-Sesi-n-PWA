import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getActiveSessionForUser } from "@/services/session/get-active-session.service";
import { SessionExperience } from "@/features/session/components/SessionExperience";

export default async function SessionPage() {
  const session = await auth();
  const userId = session!.user.id;

  const activeSession = await getActiveSessionForUser(userId);
  if (!activeSession) {
    redirect("/app/home");
  }

  return <SessionExperience initialSession={activeSession} />;
}
