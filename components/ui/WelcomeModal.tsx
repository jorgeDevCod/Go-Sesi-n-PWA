"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck2, BookOpen, Rocket, SlidersHorizontal, Sparkles, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function WelcomeModal({
  open,
  userName,
  onPersonalize,
  onPlan,
  onLearn,
  onSkip,
  onDontShowToday,
}: {
  open: boolean;
  userName: string;
  onPersonalize: () => void;
  onPlan: () => void;
  onLearn: () => void;
  onSkip: () => void;
  onDontShowToday?: () => void;
}) {
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleSelect(callback: () => void) {
    if (dontShowToday) {
      onDontShowToday?.();
    }
    callback();
  }

  if (typeof document === "undefined") return null;

  const options = [
    {
      key: "personalize",
      icon: SlidersHorizontal,
      title: "Personaliza tu App",
      description:
        "Personaliza tu experiencia a tu medida. Define tus tiempos, preferencias y cómo quieres organizar tus actividades.",
      onClick: onPersonalize,
      className: "",
    },
    {
      key: "plan",
      icon: CalendarCheck2,
      title: "Ya realicé mi personalización. Quiero planificar mi día",
      description:
        "Tu día, a tu manera. Elige las categorías y actividades que quieres realizar hoy.",
      onClick: onPlan,
      className: "",
    },
    {
      key: "learn",
      icon: BookOpen,
      title: "Prefiero conocer cómo funciona la App primero!",
      description:
        "Descubre cómo aprovecharla al máximo. Conoce las principales funciones y aprende cómo sacarles mayor provecho.",
      onClick: onLearn,
      className: "",
    },
    {
      key: "skip",
      icon: Rocket,
      title: "¡Estoy listo! Empecemos",
      description:
        "Cuéntanos cómo te sientes hoy y crearemos una experiencia pensada en ti. ⭐",
      onClick: onSkip,
      className:
        "border-accent-aprender bg-accent-aprender/5 ring-2 ring-accent-aprender/60 hover:bg-accent-aprender/10",
    },
  ];

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
              <p className="text-xs text-muted-foreground">
                Hoy es un buen día para empezar a hacer todo lo que quieras. Tu Eliges cómo quieres Iniciar hoy y te acompañaremos.
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              {options.map((option) => (
                <li key={option.key}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.onClick)}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                      option.key === "skip"
                        ? "border-accent-aprender bg-accent-aprender/5 ring-2 ring-accent-aprender/60 hover:bg-accent-aprender/10"
                        : "border-border bg-surface hover:bg-surface-hover",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        option.key === "skip"
                          ? "bg-accent-aprender text-white"
                          : "bg-accent-aprender/10 text-accent-aprender",
                      )}
                    >
                      <option.icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        {option.title}
                        {option.key === "skip" && (
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
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setDontShowToday((prev) => !prev)}
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
                {dontShowToday && <BellOff className="size-3" />}
              </span>
              No mostrar este mensaje de nuevo hoy
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
