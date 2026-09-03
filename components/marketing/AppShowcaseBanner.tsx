"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gauge,
  ListChecks,
  Palette,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ENERGY_COLORS, COMPLEXITY_LABELS } from "@/services/recommendation/energy-level";

const THEME_SWATCHES = [
  { key: "celeste", label: "Celeste", color: "#e6ebfa" },
  { key: "verde", label: "Verde", color: "#e8f2e9" },
  { key: "rosa", label: "Rosa", color: "#f4e2eb" },
  { key: "humo", label: "Humo", color: "#f2f2f2" },
  { key: "blanco", label: "Blanco", color: "#ffffff" },
  { key: "oscuro", label: "Oscuro", color: "#1c1c1f" },
];

const DIFFICULTIES = [
  { value: "LOW", label: COMPLEXITY_LABELS.LOW },
  { value: "MEDIUM", label: COMPLEXITY_LABELS.MEDIUM },
  { value: "HIGH", label: COMPLEXITY_LABELS.HIGH },
] as const;

type Slide = {
  id: string;
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  render: () => React.ReactNode;
};

const SLIDES: Slide[] = [
  {
    id: "energy",
    badge: "Energía",
    title: "Una experiencia basada en tu energia.",
    description:
      "Cuéntanos cómo te sientes hoy y Go ajusta las actividades y tiempos a tu batería del día.",
    bullets: ["Baja, media o alta", "Sugerencias acordes", "Sin exigir de más"],
    render: () => (
      <div className="grid w-full grid-cols-3 gap-2">
        {(["baja", "media", "alta"] as const).map((level) => {
          const active = level === "media";
          const color = ENERGY_COLORS[level];
          return (
            <div
              key={level}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 text-center",
                active ? "border-transparent text-white shadow-md" : "border-border bg-surface",
              )}
              style={active ? { backgroundColor: color } : undefined}
            >
              <Zap className="size-4" style={{ color: active ? "#fff" : color }} />
              <span
                className={cn("text-sm font-semibold capitalize", active ? "text-white" : "text-foreground")}
                style={active ? undefined : { color: undefined }}
              >
                {level}
              </span>
              <span
                className="text-[10px]"
                style={{ color: active ? "rgba(255,255,255,0.9)" : "var(--color-muted-foreground)" }}
              >
                {level === "baja" ? "~30 min" : level === "media" ? "~50 min" : "~75 min"}
              </span>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    id: "plan",
    badge: "Planificación",
    title: "Planifica tu día",
    description:
      "Arma tu plan por sesiones y mira su estado: En curso, En espera o Realizada.",
    bullets: ["Por categoría", "Desplegables", "Todo en tu Home"],
    render: () => (
      <div className="flex w-full flex-col gap-2">
        {[
          { name: "Leer 20 páginas", status: "En curso", cls: "blue" },
          { name: "Meditar", status: "En espera", cls: "amber" },
          { name: "Correr", status: "Realizada", cls: "green" },
        ].map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent-aprender/10 text-accent-aprender">
              <ListChecks className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.name}</span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                item.cls === "blue" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                item.cls === "amber" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                item.cls === "green" && "bg-green-500/15 text-green-600 dark:text-green-400",
              )}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "session",
    badge: "Sesiones",
    title: "Sesiones de enfoque",
    description:
      "Define la duración, inicia el cronómetro y pausa, reanuda o extiende cuando quieras.",
    bullets: ["Tiempo real", "Pausa y reanuda", "Alarma al terminar"],
    render: () => (
      <div className="flex w-full flex-col items-center gap-3 py-1">
        <div className="relative flex size-28 items-center justify-center rounded-full border-8 border-accent-aprender/15">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#6366F1 ${70}%, transparent 0)`,
              mask: "radial-gradient(circle, transparent 60%, black 61%)",
              WebkitMask: "radial-gradient(circle, transparent 60%, black 61%)",
            }}
          />
          <div className="relative flex flex-col items-center">
            <span className="text-2xl font-bold tabular-nums text-foreground">24:56</span>
            <span className="text-[10px] text-muted-foreground">restantes</span>
          </div>
        </div>
        <span className="rounded-full bg-accent-aprender px-4 py-1.5 text-xs font-semibold text-white">
          ⏸ Pausar
        </span>
      </div>
    ),
  },
  {
    id: "recommend",
    badge: "Recomendaciones",
    title: "Sugerencias a tu medida",
    description:
      "¿No sabes qué hacer? Go te recomienda la actividad ideal según tu energía y tiempo.",
    bullets: ["Top recomendado", "Preseleccionada", "Un toque para empezar"],
    render: () => (
      <div className="flex w-full flex-col gap-2">
        <div className="rounded-2xl border-2 border-accent-aprender/50 bg-accent-aprender/5 p-3">
          <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-accent-aprender px-2 py-0.5 text-[10px] font-semibold text-white">
            <Sparkles className="size-3" />
            Te recomendamos
          </span>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent-aprender/15 text-accent-aprender">
              <Clock className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">Estudiar 30 min</p>
              <p className="truncate text-xs text-muted-foreground">Hace tiempo no lo practicas</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
          Enfocado · ~30 min
        </div>
      </div>
    ),
  },
  {
    id: "customize",
    badge: "Personalización",
    title: "Todo se adapta a ti",
    description:
      "Ajusta tiempos mínimo, recomendado y máximo por energía y dificultad. Tú decides.",
    bullets: ["Min / Rec / Máx", "Por dificultad", "Se aplica al instante"],
    render: () => (
      <div className="flex w-full flex-col gap-2">
        {[
          { label: "Mínimo", value: 25 },
          { label: "Recomendado", value: 45, active: true },
          { label: "Máximo", value: 75 },
        ].map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center justify-between rounded-xl border px-3 py-2",
              item.active ? "border-accent-aprender bg-accent-aprender/5" : "border-border bg-surface",
            )}
          >
            <span className="text-sm text-foreground">{item.label}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                item.active ? "bg-accent-aprender text-white" : "bg-surface-muted text-muted-foreground",
              )}
            >
              {item.value} min
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "progress",
    badge: "Progreso",
    title: "Constancia que se nota",
    description:
      "Cada sesión queda registrada. Mira tus minutos, historial y lo que ya lograste.",
    bullets: ["Historial por día", "Minutos acumulados", "Sin culpa"],
    render: () => (
      <div className="flex w-full flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "48", label: "Sesiones" },
            { value: "22h", label: "Enfocado" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-surface p-3 text-center">
              <p className="text-xl font-bold text-accent-aprender">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
          <TrendingUp className="size-4 text-green-500" />
          <span className="text-xs text-muted-foreground">+32 min hoy</span>
        </div>
      </div>
    ),
  },
  {
    id: "mood-difficulty",
    badge: "Actividades",
    title: "Dificultad y estado de ánimo por actividad",
    description:
      "Cada actividad guarda su dificultad (Ligera, Moderada, Intensa) y el ánimo en el que mejor encaja.",
    bullets: ["Ligera / Moderada / Intensa", "Energía asociada", "Personalizable"],
    render: () => (
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Dificultad
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => {
              const active = d.value === "MEDIUM";
              return (
                <div
                  key={d.value}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-center text-xs font-semibold",
                    active
                      ? "border-accent-aprender bg-accent-aprender text-white"
                      : "border-border bg-surface text-foreground",
                  )}
                >
                  {d.label}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Estado de ánimo
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["baja", "media", "alta"] as const).map((level) => {
              const active = level === "media";
              const color = ENERGY_COLORS[level];
              return (
                <div
                  key={level}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs font-semibold capitalize",
                    active ? "border-transparent text-white" : "border-border bg-surface text-foreground",
                  )}
                  style={active ? { backgroundColor: color } : undefined}
                >
                  {active && <CheckCircle2 className="size-3" />}
                  {level}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
          <Gauge className="size-4 text-accent-aprender" />
          <span className="text-xs text-muted-foreground">
            Ej.: Leer 20 páginas · Moderada · ánimo medio
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "themes",
    badge: "Temas",
    title: "Tu tema de color, a tu estilo",
    description:
      "Elige entre varios ambientes visuales para que Go se sienta como tú, en cualquier momento.",
    bullets: ["6 temas de color", "Cambia al instante", "Armonioso en toda la app"],
    render: () => (
      <div className="flex w-full flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          {THEME_SWATCHES.map((theme) => (
            <div
              key={theme.key}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface p-2",
                theme.key === "celeste" && "ring-2 ring-accent-aprender",
              )}
            >
              <span
                className="size-8 rounded-lg border border-black/10"
                style={{ backgroundColor: theme.color }}
              />
              <span className="text-[10px] text-muted-foreground">{theme.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
          <Palette className="size-4 text-accent-aprender" />
          <span className="text-xs text-muted-foreground">Celeste, Verde, Rosa, Humo, Blanco u Oscuro</span>
        </div>
      </div>
    ),
  },
];

export function AppShowcaseBanner() {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDES.length);
  }, []);
  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-avance cada 6s (pausado mientras el usuario interactúa).
  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) next();
    }, 10000);
    return () => clearInterval(id);
  }, [next]);

  const slide = SLIDES[index];

  return (
    <div className="relative mx-auto w-full max-w-4xl my-4">
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-xl my-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onMouseEnter={() => (pausedRef.current = true)}
            onMouseLeave={() => (pausedRef.current = false)}
            className="p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2">
              {/* Texto */}
              <div className="flex flex-col items-start gap-3">
                <span className="rounded-full bg-accent-aprender/10 px-3 py-1 text-xs font-semibold text-accent-aprender">
                  {slide.badge}
                </span>
                <h3 className="font-display text-2xl font-bold leading-tight text-foreground">
                  {slide.title}
                </h3>
                <p className="text-sm font-normal leading-[1.6] text-muted-foreground">
                  {slide.description}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {slide.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-1 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      <CheckCircle2 className="size-3.5 text-accent-aprender" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mini-mockup */}
              <div className="flex justify-center rounded-2xl border border-border bg-background p-5">
                {slide.render()}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver ${s.title}`}
              className={cn(
                "h-1.5 cursor-pointer rounded-full transition-all duration-200",
                i === index ? "w-6 bg-accent-aprender" : "w-3 bg-border hover:bg-border-hover",
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { pausedRef.current = true; setTimeout(() => (pausedRef.current = false), 5000); prev(); }}
            aria-label="Anterior"
            className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => { pausedRef.current = true; setTimeout(() => (pausedRef.current = false), 5000); next(); }}
            aria-label="Siguiente"
            className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
