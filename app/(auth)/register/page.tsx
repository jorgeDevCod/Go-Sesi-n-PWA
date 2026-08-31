import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Crea tu cuenta",
  description: "Empieza gratis en Go Sesión: menos decisiones, más sesiones.",
};

export default function RegisterPage() {
  return (
    <AuthShell title="Crea tu cuenta" subtitle="Deja de decidir. Solo empieza.">
      <RegisterForm />
    </AuthShell>
  );
}
