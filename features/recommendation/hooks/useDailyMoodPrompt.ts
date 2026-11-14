"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  hasShownMoodPromptThisSession,
  isMoodPromptSuppressedToday,
  markMoodPromptShownThisSession,
} from "@/features/recommendation/mood.storage";
import { ROUTES } from "@/lib/routes";

/**
 * Muestra la pregunta de energía al entrar al Home hasta que el usuario
 * marque "No volver a mostrar hoy". Se limita a una vez por apertura para no
 * interrumpir cada navegación.
 */
export function useDailyMoodPrompt(enabled: boolean) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled || pathname !== ROUTES.home) {
      const timer = setTimeout(() => setOpen(false), 0);
      return () => clearTimeout(timer);
    }
    if (isMoodPromptSuppressedToday() || hasShownMoodPromptThisSession()) return;

    const timer = setTimeout(() => {
      markMoodPromptShownThisSession();
      setOpen(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [enabled, open, pathname]);

  return {
    open: open && pathname === ROUTES.home,
    close: () => setOpen(false),
  };
}
