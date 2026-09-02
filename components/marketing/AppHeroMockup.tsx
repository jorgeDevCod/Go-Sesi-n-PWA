"use client";

import { motion } from "framer-motion";
import {
  BatteryMedium,
  Camera,
  Gauge,
  CalendarCheck2,
  Sparkles,
  House,
} from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { ENERGY_COLORS } from "@/services/recommendation/energy-level";

const FEATURES = [
  { label: "Home", icon: House },
  { label: "Temas", icon: Camera },
  { label: "Planificación", icon: CalendarCheck2 },
  { label: "Recomendaciones", icon: Sparkles },
];

const CATEGORIES = [
  { name: "Aprender", icon: "BookOpen", color: "#6366F1", count: 12 },
  { name: "Salud", icon: "HeartPulse", color: "#16A34A", count: 14 },
  { name: "Finanzas", icon: "Wallet", color: "#D97706", count: 10 },
  { name: "Diversión", icon: "Palette", color: "#D946EF", count: 13 },
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
  { name: "Siesta reparadora", status: "Realizada", cls: "green" },
  { name: "Leer 20 páginas", status: "En curso", cls: "blue" },
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

          {/* Grid de capturas: Home, Temas, Planificación, Recomendaciones */}
          <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Home */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-aprender">
                Home
              </p>
              <p className="text-xs font-semibold text-foreground">
                ¡Hola de nuevo, Jorge!
              </p>
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
              <div className="flex flex-col gap-1.5">
                {CATEGORIES.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
                    <span
                      className="flex size-5 items-center justify-center rounded"
                      style={{ backgroundColor: `${c.color}22`, color: c.color }}
                    >
                      <DynamicIcon name={c.icon} className="size-3" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-foreground">
                      {c.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{c.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Temas */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-background p-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-aprender">
                Temas
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {THEMES.map((t, i) => (
                  <div
                    key={t.label}
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5"
                    style={i === 2 ? { background: "var(--color-surface-muted)" } : undefined}
                  >
                    <span
                      className="size-4 rounded-full border border-border"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-[10px] text-foreground">{t.label}</span>
                    {i === 2 && <Sparkles className="ml-auto size-3 text-accent-aprender" />}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Planificación */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-aprender">
                Planificación
              </p>
              <p className="text-[10px] text-muted-foreground">Tu plan para hoy</p>
              <div className="flex flex-col gap-1.5">
                {PLAN.map((p) => (
                  <div key={p.name} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
                    <span className="min-w-0 flex-1 truncate text-[10px] text-foreground">{p.name}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold",
                        p.cls === "green" && "bg-green-500/15 text-green-600 dark:text-green-400",
                        p.cls === "blue" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                      )}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-accent-aprender px-3 py-2 text-center text-[10px] font-semibold text-white">
                Guardar planificación
              </div>
            </motion.div>

            {/* Recomendaciones */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-border bg-background p-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-aprender">
                Recomendaciones
              </p>
              <div className="mt-2 flex flex-col items-start gap-1.5">
                <span className="rounded-full bg-accent-aprender/10 px-2 py-0.5 text-[9px] font-semibold text-accent-aprender">
                  Energía Media · 50 min
                </span>
                <div className="flex w-full items-center gap-2 rounded-lg border border-accent-aprender/40 bg-accent-aprender/5 px-2 py-2">
                  <span className="flex size-6 items-center justify-center rounded bg-amber-100 text-amber-600">
                    <Gauge className="size-3" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold text-foreground">Revisar presupuesto</p>
                    <p className="text-[9px] text-muted-foreground">Finanzas · 50 min</p>
                  </div>
                </div>
                <div className="w-full rounded-lg bg-accent-aprender px-3 py-2 text-center text-[10px] font-semibold text-white">
                  ▶ Empezar
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
