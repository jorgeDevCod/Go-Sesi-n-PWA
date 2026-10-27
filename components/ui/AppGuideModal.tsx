"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BatteryMedium,
  CalendarCheck2,
  Layers,
  MousePointerClick,
  PlayCircle,
  Sparkles,
  SlidersHorizontal,
  Palette,
  Menu,
  Download,
  Trash2,
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
    icon: Sparkles,
    title: "Tu bienvenida",
    description:
      "Elige cómo empezar: Vamos Ya, una recomendación, planificar tu día o personalizar tu experiencia. Solo seleccionas una tarjeta y confirmas con Ingresar. También puedes cambiar de cuenta desde ese mismo modal.",
  },
  {
    icon: BatteryMedium,
    title: "Tu energía del día",
    description:
      "En el Home eliges baja, media o alta. Go adapta las actividades y sugerencias a tu estado. El último nivel elegido se conserva para la próxima vez.",
  },
  {
    icon: CalendarCheck2,
    title: "Planificación en un solo lugar",
    description:
      "Abre Planificación desde el header o la bienvenida. Elige una categoría, marca sus actividades y se irán sumando a \"Esta es tu Planificación\". Todas las actividades, de cualquier categoría, aparecen en una sola lista con su etiqueta de categoría. Puedes quitar una o usar \"Quitar todo\".",
  },
  {
    icon: Layers,
    title: "Categorías y actividades",
    description:
      "En Personalizar → Actividades eliges una categoría y ves sus actividades. Puedes crear, editar, reordenar o iniciar una actividad sin volver al Home. Desde ahí también cambias de categoría con un toque.",
  },
  {
    icon: MousePointerClick,
    title: "Tiempos a tu medida",
    description:
      "El tiempo se ajusta justo antes de empezar, en la vista de inicio. Toca un tiempo sugerido o escribe el que quieras. En Pomodoro puedes elegir un preset y editar foco, descanso y ciclos. Go recuerda tu último ajuste para esa actividad, incluso si cambias de dispositivo.",
  },
  {
    icon: PlayCircle,
    title: "Sesiones de enfoque",
    description:
      "Elige Clásico o Pomodoro, ajusta el tiempo y comienza. Puedes pausar, reanudar y extender la sesión. Si cierras la pestaña sin terminar, al volver te avisamos para retomar donde quedaste.",
  },
  {
    icon: Sparkles,
    title: "Recomendaciones inteligentes",
    description:
      "Cuando no sepas por dónde empezar, usa \"No sé qué hacer\". Según tu energía y dificultad, Go te sugiere las actividades más indicadas. Desde Recomendaciones eliges qué actividades mostrar; los tiempos los ajustas al iniciar.",
  },
  {
    icon: SlidersHorizontal,
    title: "Personaliza tu experiencia",
    description:
      "En Personalizar encontrarás Categorías, Actividades y Recomendaciones. Define categorías, actividades y qué sugerir según energía y dificultad. Los tiempos ya no se configuran aquí: se ajustan en la vista de inicio.",
  },
  {
    icon: Menu,
    title: "Navegación y ayuda",
    description:
      "En computadora tienes Inicio, Planificación, Personalizar, Historial, Papelera y Cuenta. En móvil, el menú hamburguesa. El botón de ayuda del header abre esta guía cuando la necesites.",
  },
  {
    icon: Palette,
    title: "Temas de color",
    description:
      "Elige el ambiente visual que más te guste: Celeste, Humo, Rosa, Blanco u Oscuro. Puedes cambiarlo cuando quieras desde el botón circular del header.",
  },
  {
    icon: Trash2,
    title: "Papelera y recuperación",
    description:
      "Cuando eliminas una actividad o una categoría vacía, pasa a la papelera. Guarda hasta 50 artículos durante 15 días. Puedes restaurarlos, vaciarla o borrar definitivamente. Al eliminar tienes 5 segundos para deshacer.",
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
