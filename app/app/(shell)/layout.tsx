import { auth } from "@/auth";
import { findUserById } from "@/repositories/user.repository";
import { AppShell } from "@/components/layout/AppShell";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const user = userId ? await findUserById(userId) : null;
  const userName = user?.name?.split(" ")[0] ?? "";

  return <AppShell userName={userName}>{children}</AppShell>;
}
