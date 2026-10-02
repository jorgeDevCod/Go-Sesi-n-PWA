import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recupera tu contraseña",
  description: "Te enviamos un enlace para crear una nueva contraseña.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="¿Olvidaste tu contraseña?"
      subtitle="Escribe tu correo y te enviamos un enlace válido por 1 hora."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
