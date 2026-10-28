"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { previousAppPath } from "@/lib/navigation-history";

/**
 * Vuelve a la vista anterior. Usa el historial del navegador cuando existe y,
 * si no, recurre a la pila de navegación de la app. Así el botón de atrás no
 * cae siempre en Inicio.
 */
export function useAppBack(fallback: string = ROUTES.home) {
  const pathname = usePathname();
  const router = useRouter();

  return useCallback(() => {
    if (typeof window === "undefined") return;

    if (window.history.length > 1) {
      router.back();
      return;
    }

    const previous = previousAppPath(pathname);
    router.replace(previous ?? fallback);
  }, [fallback, pathname, router]);
}
