"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck2,
  LogOut,
  Rocket,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WelcomeOption = "start" | "recommend" | "plan" | "personalize";

const OPTIONS: {
  key: WelcomeOption;
  icon: typeof Rocket;
  title: string;
  description: string;
}[] = [
  {
    key: "start",
    icon: Rocket,
    title: "¡Vamos Ya!",
    description: "Empieza ya, sin pensarlo más.",
  },
  {
    key: "recommend",
    icon: Sparkles,
    title: "Recibir una recomendación",
    description: "Deja que Go elija tu siguiente paso.",
  },
  {
    key: "plan",
    icon: CalendarCheck2,
    title: "Quiero planificar mi día",
    description: "Organiza tu día en minutos.",
  },
  {
    key: "personalize",
    icon: SlidersHorizontal,
    title: "Personalizar mi Experiencia",
    description: "Ajusta todo a tu medida.",
  },
];

export function WelcomeModal({
  open,
  userName,
  onConfirm,
  onSwitchAccount,
  onDontShowToday,
}: {
  open: boolean;
  userName: string;
  onConfirm: (option: WelcomeOption) => void;
  onSwitchAccount: () => void;
  onDontShowToday?: () => void;
}) {
  const [selected, setSelected] = useState<WelcomeOption>("start");
  const [dontShowToday, setDontShowToday] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open && !wasOpen) {
    setWasOpen(true);
    setSelected("start");
    setDontShowToday(false);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function toggleDontShowToday() {
    setDontShowToday((prev) => {
      const next = !prev;
      if (next) onDontShowToday?.();
      return next;
    });
  }

  function handleConfirm() {
    if (dontShowToday) onDontShowToday?.();
    onConfirm(selected);
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Bienvenida"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative flex max-h-[92vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-xl"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-accent-aprender/10 text-accent-aprender">
                <Sparkles className="size-6" />
              </span>
              <h2 className="font-display text-xl font-semibold text-foreground">
                ¡Bienvenido de nuevo, {userName}!
              </h2>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                Hoy es un buen día para iniciar tus planes. Elige cómo quieres iniciar y
                empecemos a avanzar.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {OPTIONS.map((option) => {
                const active = selected === option.key;
                const recommended = option.key === "start";
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelected(option.key)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                      active
                        ? "border-accent-aprender bg-accent-aprender/10 ring-2 ring-accent-aprender/60"
                        : "border-border bg-surface hover:bg-surface-hover",
                      recommended && !active && "border-accent-aprender/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        active
                          ? "bg-accent-aprender text-white"
                          : "bg-accent-aprender/10 text-accent-aprender",
                      )}
                    >
                      <option.icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                        {option.title}
                        {recommended && (
                          <span className="rounded-full bg-accent-aprender px-2 py-0.5 text-[10px] font-semibold text-white">
                            Recomendada
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={toggleDontShowToday}
              className="flex w-full cursor-pointer items-center justify-start gap-4 rounded-2xl border border-dashed border-border bg-surface-muted px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-accent-aprender/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-md border transition-colors",
                  dontShowToday
                    ? "border-accent-aprender bg-accent-aprender text-white"
                    : "border-border bg-surface",
                )}
              >
                {dontShowToday && <span className="text-[10px]">✓</span>}
              </span>
              No mostrar este mensaje de nuevo hoy
            </button>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={onSwitchAccount}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
              >
                <LogOut className="size-4" />
                Cambiar de cuenta
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-accent-aprender px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-accent-aprender-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
              >
                Ingresar
                <ArrowRight className="size-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
