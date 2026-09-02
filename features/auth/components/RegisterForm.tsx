"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  registerAction,
  type RegisterActionState,
} from "@/features/auth/actions/register.action";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";

const initialState: RegisterActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Creando cuenta..." : "Crear cuenta"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div>
        <Label htmlFor="name">Nombre Completo</Label>
        <Input id="name" name="name" type="text" autoComplete="name" required />
        <FieldError messages={state.fieldErrors?.name} />
      </div>
      <div>
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        <FieldError messages={state.fieldErrors?.email} />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          La contraseña debe contener: mayúscula, minúscula, número y símbolo especial.
        </p>
        <FieldError messages={state.fieldErrors?.password} />
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
        <FieldError messages={state.fieldErrors?.confirmPassword} />
      </div>

      {state.error && (
        <p className="text-sm text-red-500" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton />

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-foreground underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
