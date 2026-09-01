import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Crea tu cuenta",
  description: "Empieza gratis en Go Sesión: menos decisiones, más sesiones.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Empieza gratis en menos de un minuto. Deja de decidir qué hacer y deja que Go te acompañe en tu siguiente paso."
    >
      <RegisterForm />
    </AuthShell>
  );
}
