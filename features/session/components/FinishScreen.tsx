"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { DurationPicker } from "@/features/session/components/DurationPicker";
import type { SessionDTO } from "@/services/session/session.dto";

const EXTEND_CHIPS = [10, 20, 30, 60];

export function FinishScreen({
  session,
  isPending,
  onExtend,
}: {
  session: SessionDTO;
  isPending: boolean;
  onExtend: (extraMinutes: number) => void;
}) {
  const router = useRouter();
  const [showExtend, setShowExtend] = useState(false);
  const isCompleted = session.status === "COMPLETED";
  const actualMinutes = session.actualMinutes ?? 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      {isCompleted ? (
        <>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl font-semibold text-foreground">
              ¡Excelente trabajo! Terminaste tu sesión.
            </p>
            <p className="text-muted-foreground">
              {session.categoryName} · {session.subcategoryName} · {actualMinutes} minutos
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Cada minuto cuenta y hoy diste un paso más. Tu esfuerzo se suma.
            </p>
          </div>

          {!showExtend ? (
            <div className="flex w-full max-w-sm flex-col items-center gap-4">
              <p className="text-lg font-medium text-foreground">¿Qué hacemos ahora?</p>
              <div className="flex w-full flex-col gap-3">
                <Button
                  onClick={() => router.push("/app/home")}
                  disabled={isPending}
                  title="Volver al Home"
                  size="lg"
                  className="w-full"
                >
                  Volver al Home
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowExtend(true)}
                  disabled={isPending}
                  title="Seguir con esta actividad"
                  className="w-full"
                >
                  Sí, seguir un rato más
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/app/session/recommend")}
                  disabled={isPending}
                  title="Explorar otra actividad"
                  className="w-full"
                >
                  ¿Y si seguimos con algo más ligero?
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex w-full max-w-sm flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Elige cuánto más quieres continuar.
              </p>
              <DurationPicker chipPrefix="+" chips={EXTEND_CHIPS} onSelect={onExtend} />
              <Button
                variant="ghost"
                onClick={() => setShowExtend(false)}
                disabled={isPending}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl font-semibold text-foreground">
              ¡Buen esfuerzo! Sesión finalizada.
            </p>
            <p className="text-muted-foreground">
              {session.categoryName} · {session.subcategoryName} · {actualMinutes} minutos avanzados
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              El progreso también se celebra, no todo tiene que ser perfecto. Avanzaste{" "}
              {actualMinutes} minutos y eso cuenta.
            </p>
          </div>

          <div className="flex w-full max-w-sm flex-col items-center gap-4">
            <p className="text-lg font-medium text-foreground">¿Qué tal ahora?</p>
            <div className="flex w-full flex-col gap-3">
              <Button
                size="lg"
                onClick={() => router.push("/app/subcategories")}
                disabled={isPending}
                title="Ver todas las actividades"
                className="w-full"
              >
                Ver todas las actividades
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push("/app/session/recommend")}
                disabled={isPending}
                title="Encontrar algo más acorde"
                className="w-full"
              >
                Quizás algo más corto o de otra dificultad
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/app/home")}
                disabled={isPending}
                title="Volver al Home"
                className="w-full"
              >
                Volver al Home
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
