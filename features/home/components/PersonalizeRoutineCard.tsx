"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";

const STORAGE_KEY = "gosession-personalize-seen";

export function PersonalizeRoutineCard() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) !== "1";
    } catch {
      return true;
    }
  });

  function dismiss() {
    setVisible(false);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Storage unavailable.
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-14 right-4 z-30 w-full max-w-sm"
        >
          <div className="relative flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-lg">
            <button
              type="button"
              onClick={dismiss}
              aria-label="Cerrar mensaje"
              title="Cerrar"
              className="absolute top-2 right-2 flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              <X className="size-3.5" />
            </button>

            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-aprender/10 text-accent-aprender">
              <SlidersHorizontal className="size-5" />
            </span>

            <div className="min-w-0 flex-1 pr-4">
              <p className="text-sm font-semibold text-foreground">
                Personaliza tus recomendaciones
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Cuéntanos cómo estás, qué quieres hacer y cuánto tiempo tienes.
              </p>
              <Link
                href="/app/routine"
                className="mt-2 inline-block text-xs font-medium text-accent-aprender underline-offset-2 hover:underline"
              >
                Mejorar mis recomendaciones
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
