"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { resetPasswordAction } from "@/features/auth/actions/password-reset.actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await resetPasswordAction({
        token,
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
      });
      if (result.success) {
        setDone(true);
      } else {
        setError(result.error);
        if ("fieldErrors" in result && result.fieldErrors) {
          setFieldErrors(result.fieldErrors as Record<string, string[] | undefined>);
        }
      }
    });
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-lg font-semibold text-foreground">Contraseña actualizada.</p>
        <p className="text-sm text-muted-foreground">Ya puedes entrar con tu nueva contraseña.</p>
        <Link href="/login" className="font-medium text-foreground underline">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError messages={fieldErrors.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirma tu contraseña</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError messages={fieldErrors.confirmPassword} />
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar contraseña"}
      </Button>
    </form>
  );
}
