"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BatteryMedium,
  CalendarCheck2,
  Layers,
  Timer,
  Sparkles,
  SlidersHorizontal,
  Palette,
  Menu,
  Download,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePwaInstall } from "@/hooks/use-pwa-install";

function subscribeNoop() {
  return () => {};
}

// Hydration-safe "are we on the client yet" check (see ThemeToggle).
function useMounted() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

const SECTIONS = [
  {
    icon: BatteryMedium,
    title: "Tu bienvenida y energía del día",
    description:
      "Cada vez que entras te damos la bienvenida y te preguntamos cómo te sientes. Solo una vez al día ajustamos tu Home según tu energía: baja, media o alta. Si prefieres, puedes decir \"no mostrar más hoy\" y seguir tranquilo.",
  },
  {
    icon: CalendarCheck2,
    title: "Tu plan del día",
    description:
      "Abre tu plan desde el botón \"Planificación\" o la bienvenida. Elige categorías y vincula las actividades que harás. También puedes crear actividades nuevas directamente desde aquí. Cada categoría se pliega y despliega para que lo tengas todo ordenado.",
  },
  {
    icon: Layers,
    title: "Categorías y actividades",
    description:
      "Organiza tu vida en categorías y dentro de cada una crea actividades. Cada actividad tiene dificultad (Ligera, Moderada o Intensa) y puedes asignarle el estado de ánimo en el que mejor encaja. Desde la vista de actividades puedes filtrar por energía y dificultad para encontrar justo la que necesitas.",
  },
  {
    icon: Timer,
    title: "Sesiones de enfoque",
    description:
      "Toca una actividad, elige cuántos minutos quieres dedicarle y comienza tu sesión. Puedes pausar, reanudar y extender el tiempo. Si cierras la pestaña sin terminar, al volver te avisamos para que retomes justo donde quedaste.",
  },
  {
    icon: Sparkles,
    title: "Recomendaciones inteligentes",
    description:
      "Cuando no sepas por dónde empezar, usa \"No sé qué hacer\". Según tu energía y el tiempo disponible te sugerimos las actividades más indicadas, con la mejor preseleccionada. Puedes ajustar los tiempos mínimo, recomendado y máximo para cada combinación de energía y dificultad.",
  },
  {
    icon: SlidersHorizontal,
    title: "Personaliza tu experiencia",
    description:
      "En la sección Personalizar encontrarás tres pestañas: Categorías, Actividades y Recomendaciones. Desde Recomendaciones defines tiempos y eliges qué actividades aparecen para cada nivel de energía y dificultad. Todo se aplica enseguida a tus sugerencias.",
  },
  {
    icon: Menu,
    title: "Navegación",
    description:
      "En computadora tienes Planificación, Historial, Actividades, Personalizar y Cerrar sesión en la parte superior. En móvil todo se organiza en el menú hamburguesa, con el cambio de tema siempre a mano.",
  },
  {
    icon: Palette,
    title: "Temas de color",
    description:
      "Elige el ambiente visual que más te guste: Celeste, Verde, Humo, Rosa, Blanco u Oscuro. Puedes cambiarlo cuando quieras desde el botón circular del header.",
  },
];

export function AppGuideModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { canInstall, installed, install } = usePwaInstall();
  const mounted = useMounted();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Cómo usar Go Sesión"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              title="Cerrar"
              className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              <X className="size-4" />
            </button>

            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Bienvenido a Go Sesión
              </h2>
              <div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Descubre todo lo que Go puede hacer por ti
                </p>
              </div>

            </div>

            <ul className="flex flex-col gap-3">
              {SECTIONS.map((section) => (
                <li
                  key={section.title}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-surface-muted p-3.5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-aprender/10 text-accent-aprender">
                    <section.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {section.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-border bg-surface-muted p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-aprender/10 text-accent-aprender">
                  <Download className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Descargar como app
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    Instala Go Sesión en tu dispositivo para usarla a pantalla
                    completa, como una app nativa.
                  </p>

                  {installed ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      <Check className="size-3.5" />
                      App instalada
                    </p>
                  ) : canInstall ? (
                    <Button size="md" onClick={install} className="mt-2 gap-1.5">
                      <Download className="size-4" />
                      Descargar como app
                    </Button>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Android/escritorio: usa “Instalar app” en el menú del
                      navegador. iPhone/iPad: Compartir → “Añadir a pantalla de
                      inicio”.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button size="lg" onClick={onClose} className="w-full p-6">
              ¡Comprendo. Iniciemos!
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
