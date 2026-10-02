"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { requestPasswordResetAction } from "@/features/auth/actions/password-reset.actions";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordResetAction(formData.get("email"));
      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      {message && (
        <p className="text-sm text-foreground" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar enlace"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
