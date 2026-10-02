import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { checkResetTokenAction } from "@/features/auth/actions/password-reset.actions";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  description: "Crea una nueva contraseña para tu cuenta.",
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await checkResetTokenAction(token);

  return (
    <AuthShell
      title="Nueva contraseña"
      subtitle="Elige una contraseña segura para tu cuenta."
    >
      {!result.success || !result.valid ? (
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-red-500" role="alert">
            El enlace ya no es válido. Pide uno nuevo.
          </p>
          <a href="/forgot-password" className="font-medium text-foreground underline">
            Pedir nuevo enlace
          </a>
        </div>
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </AuthShell>
  );
}
