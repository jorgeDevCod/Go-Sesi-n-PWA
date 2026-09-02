"use client";

import { motion } from "framer-motion";
import {
  BatteryMedium,
  Gauge,
  CalendarCheck2,
  Search,
  Sparkles,
  House,
  ListChecks,
  Palette,
  X,
} from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { ENERGY_COLORS } from "@/services/recommendation/energy-level";

const FEATURES = [
  { label: "Home", icon: House },
  { label: "Actividades", icon: ListChecks },
  { label: "Planificación", icon: CalendarCheck2 },
  { label: "Recomendaciones", icon: Sparkles },
];

const CATEGORIES = [
  { name: "Aprender", icon: "BookOpen", color: "#6366F1", count: 12 },
  { name: "Salud", icon: "HeartPulse", color: "#16A34A", count: 14 },
  { name: "Finanzas", icon: "Wallet", color: "#D97706", count: 10 },
  { name: "Diversión", icon: "Palette", color: "#D946EF", count: 13 },
];

const DIFFICULTIES = ["Ligera", "Moderada", "Intensa"];

const ACTIVITIES = [
  { name: "Leer 20 páginas", icon: "BookOpen", color: "#6366F1", difficulty: "Moderada", energy: "Media" },
  { name: "Yoga", icon: "Flower", color: "#D946EF", difficulty: "Ligera", energy: "Media" },
  { name: "Revisar presupuesto", icon: "Wallet", color: "#D97706", difficulty: "Intensa", energy: "Alta" },
];

const THEMES = [
  { label: "Oscuro", color: "#1c1c1f" },
  { label: "Blanco", color: "#d5d8e0" },
  { label: "Humo", color: "#c9c8ce" },
  { label: "Rosa", color: "#d3adbf" },
  { label: "Celeste", color: "#8a97e0" },
  { label: "Verde", color: "#78b98e" },
];

const PLAN = [
  { name: "Meditación", status: "Realizada", cls: "green" },
  { name: "Leer 20 páginas", status: "En curso", cls: "blue" },
  { name: "Siesta reparadora", status: "En espera", cls: "amber" },
];

const RECOMMENDATIONS = [
  { name: "Revisar presupuesto", icon: "Wallet", color: "#D97706", cat: "Finanzas", min: 50, diff: "Moderada", top: true },
  { name: "Planificar finanzas", icon: "TrendingUp", color: "#D97706", cat: "Finanzas", min: 50, diff: "Moderada" },
  { name: "Yoga", icon: "Flower", color: "#D946EF", cat: "Salud", min: 50, diff: "Moderada" },
];

export function AppHeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Etiquetas flotantes de funciones */}
      <div className="pointer-events-none absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 flex-wrap justify-center gap-2 sm:top-0">
        {FEATURES.map((f) => (
          <span
            key={f.label}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-md"
          >
            <f.icon className="size-3.5 text-accent-aprender" />
            {f.label}
          </span>
        ))}
      </div>

      {/* Mini modal de temas flotante (esquina) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute right-2 top-10 z-10 hidden w-32 rounded-xl border border-border bg-surface p-2 shadow-lg sm:block"
      >
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-accent-aprender">
            <Palette className="size-3" />
            Temas
          </span>
          <span className="text-muted-foreground"><X className="size-3" /></span>
        </div>
        <div className="flex flex-col gap-1">
          {THEMES.slice(0, 4).map((t) => (
            <div key={t.label} className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-1.5 py-1">
              <span className="size-3.5 rounded-full border border-border" style={{ backgroundColor: t.color }} />
              <span className="text-[9px] text-foreground">{t.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Imagen de fondo: composición de capturas */}
      <div className="overflow-hidden rounded-3xl border border-border bg-background p-3 shadow-2xl sm:p-4">
        <div className="rounded-2xl border border-border bg-surface shadow-inner">
          {/* Encabezado tipo app */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Logo showWordmark />
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10px] font-medium text-muted-foreground sm:flex">
                <BatteryMedium className="size-3 text-accent-aprender" />
                Media
              </span>
              <span className="flex size-6 items-center justify-center rounded-full bg-accent-aprender/15 text-[10px] font-semibold text-accent-aprender">
                G
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-3">
            {/* Fila 1: Home (más corta) + Actividades */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Home — corta, 2 items por sección */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-aprender">Home</p>
                <p className="text-xs font-semibold text-foreground">¡Hola de nuevo, Jorge!</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["baja", "media", "alta"] as const).map((lvl) => {
                    const active = lvl === "media";
                    const color = ENERGY_COLORS[lvl];
                    return (
                      <div
                        key={lvl}
                        className={cn(
                          "flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5",
                          active ? "border-transparent text-white" : "border-border bg-surface",
                        )}
                        style={active ? { backgroundColor: color } : undefined}
                      >
                        <BatteryMedium className="size-3" style={{ color: active ? "#fff" : color }} />
                        <span className="text-[8px] capitalize">{lvl}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-accent-aprender px-2 py-2 text-white">
                  <Sparkles className="size-3.5 shrink-0" />
                  <span className="min-w-0 flex-1 text-[9px] font-semibold leading-tight">
                    Deja que Go te recomiende algo
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {CATEGORIES.slice(0, 2).map((c) => (
                    <div key={c.name} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
                      <span className="flex size-5 items-center justify-center rounded" style={{ backgroundColor: `${c.color}22`, color: c.color }}>
                        <DynamicIcon name={c.icon} className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-foreground">{c.name}</span>
                      <span className="text-[9px] text-muted-foreground">{c.count}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5">
                  {PLAN.slice(0, 2).map((p) => (
                    <div key={p.name} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
                      <span className="min-w-0 flex-1 truncate text-[10px] text-foreground">{p.name}</span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold",
                          p.cls === "green" && "bg-green-500/15 text-green-600 dark:text-green-400",
                          p.cls === "blue" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                          p.cls === "amber" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                        )}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Actividades (reemplaza Temas) — 2 cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-aprender">Actividades</p>
                <p className="text-[10px] text-muted-foreground">Con dificultad y estado de ánimo</p>

                {/* Barra de búsqueda */}
                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
                  <Search className="size-3 shrink-0 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">Buscar actividad...</span>
                </div>

                {/* Selector de dificultad */}
                <div className="flex flex-wrap gap-1">
                  {DIFFICULTIES.map((d, i) => (
                    <span
                      key={d}
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[8px] font-semibold",
                        i === 1 ? "border-accent-aprender bg-accent-aprender text-white" : "border-border bg-surface text-muted-foreground",
                      )}
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5">
                  {ACTIVITIES.map((a) => (
                    <div key={a.name} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
                      <span className="flex size-6 items-center justify-center rounded-lg" style={{ backgroundColor: `${a.color}22`, color: a.color }}>
                        <DynamicIcon name={a.icon} className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-foreground">{a.name}</span>
                      <span className="shrink-0 rounded-full bg-accent-aprender/10 px-1.5 py-0.5 text-[8px] font-semibold text-accent-aprender">
                        {a.difficulty}
                      </span>
                      <span className="shrink-0 rounded-full bg-surface-muted px-1.5 py-0.5 text-[8px] text-muted-foreground">
                        {a.energy}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-2 py-1.5">
                  <Gauge className="size-3.5 text-accent-aprender" />
                  <span className="text-[9px] text-muted-foreground">Filtra por energía y dificultad</span>
                </div>
              </motion.div>
            </div>

            {/* Planificación — ancho completo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-aprender">Planificación</p>
              <p className="text-[10px] text-muted-foreground">Tu plan para hoy</p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {PLAN.map((p) => (
                  <div key={p.name} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
                    <span className="min-w-0 flex-1 truncate text-[10px] text-foreground">{p.name}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold",
                        p.cls === "green" && "bg-green-500/15 text-green-600 dark:text-green-400",
                        p.cls === "blue" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                        p.cls === "amber" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-accent-aprender px-3 py-2 text-white">
                <CalendarCheck2 className="size-3.5" />
                <span className="text-[10px] font-semibold">Guardar planificación</span>
              </div>
            </motion.div>

            {/* Recomendaciones — ancho completo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-aprender">Recomendaciones</p>
                <span className="rounded-full bg-accent-aprender/10 px-2 py-0.5 text-[9px] font-semibold text-accent-aprender">
                  Energía Media · ~50 min
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                {RECOMMENDATIONS.map((r) => (
                  <div
                    key={r.name}
                    className={cn(
                      "flex flex-col gap-1.5 rounded-lg border bg-surface px-2 py-2",
                      r.top ? "border-accent-aprender/50 bg-accent-aprender/5" : "border-border",
                    )}
                  >
                    {r.top && (
                      <span className="inline-flex items-center gap-1 self-start rounded-full bg-accent-aprender px-1.5 py-0.5 text-[8px] font-semibold text-white">
                        <Sparkles className="size-2.5" /> Recomendada
                      </span>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="flex size-5 items-center justify-center rounded" style={{ backgroundColor: `${r.color}22`, color: r.color }}>
                        <DynamicIcon name={r.icon} className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-foreground">{r.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className="rounded-full bg-accent-aprender/10 px-1.5 py-0.5 text-[8px] font-semibold text-accent-aprender">
                        {r.min} min
                      </span>
                      <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[8px] text-muted-foreground">
                        {r.diff}
                      </span>
                    </div>
                    <div className="rounded-lg bg-accent-aprender px-2 py-1.5 text-center text-[9px] font-semibold text-white">
                      ▶ Empezar
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
