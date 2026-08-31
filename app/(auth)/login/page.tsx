import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Inicia sesión",
  description: "Entra a Go Sesión y Reserva tu espacio y haz que cada momento cuente.",
};

export default function LoginPage() {
  return (
    <AuthShell title="Hola de nuevo" subtitle="Solo elige el siguiente paso.">
      <LoginForm />
    </AuthShell>
  );
}
