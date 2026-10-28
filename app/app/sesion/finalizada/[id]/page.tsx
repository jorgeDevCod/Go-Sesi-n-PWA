import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FinishedSession } from "@/features/session/components/FinishedSession";
import { getSessionForUser } from "@/services/session/get-session.service";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Sesión finalizada",
};

export default async function FinishedSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const finished = await getSessionForUser(id, session!.user.id);

  if (!finished) redirect(ROUTES.home);
  if (finished.status === "ACTIVE") redirect(ROUTES.session);

  return <FinishedSession session={finished} />;
}
