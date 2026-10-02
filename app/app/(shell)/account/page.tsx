import type { Metadata } from "next";
import { auth } from "@/auth";
import { findUserById } from "@/repositories/user.repository";
import { AccountView } from "@/features/account/components/AccountView";

export const metadata: Metadata = {
  title: "Cuenta",
};

export default async function AccountPage() {
  const session = await auth();
  const user = await findUserById(session!.user.id);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-display mb-6 text-3xl font-bold text-foreground">Cuenta</h1>
      <AccountView userName={user?.name ?? ""} email={user?.email ?? ""} />
    </div>
  );
}
