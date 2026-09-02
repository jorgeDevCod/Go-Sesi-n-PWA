"use client";

import { motion } from "framer-motion";
import {
  BatteryMedium,
  CalendarCheck2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  House,
  Layers,
  ListChecks,
  Palette,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wand2,
  X,
  Play,
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
  { label: "Personalizar", icon: Wand2 },
];

const THEMES = [
  { label: "Oscuro", color: "#1c1c1f" },
  { label: "Blanco", color: "#d5d8e0" },
  { label: "Humo", color: "#c9c8ce" },
  { label: "Rosa", color: "#d3adbf" },
  { label: "Celeste", color: "#8a97e0" },
  { label: "Verde", color: "#78b98e" },
];

const CATEGORY_TABS = [
  { name: "Aprender", icon: "BookOpen", color: "#6366F1" },
  { name: "Salud", icon: "HeartPulse", color: "#16A34A" },
  { name: "Entrenamiento", icon: "Dumbbell", color: "#D946EF" },
  { name: "Diversión", icon: "Palette", color: "#F59E0B" },
];

const ACTIVITY_CARDS = [
  { name: "Programación", icon: "Code2", color: "#6366F1", difficulty: "Intensa" },
  { name: "Inglés", icon: "Languages", color: "#38BDF8", difficulty: "Moderada" },
  { name: "Arquitectura", icon: "Landmark", color: "#8B5CF6", difficulty: "Intensa" },
  { name: "Spring", icon: "Leaf", color: "#22C55E", difficulty: "Intensa" },
];

const PLAN = [
  { name: "Meditación", status: "Realizada", cls: "green" },
  { name: "Leer 20 páginas", status: "En curso", cls: "blue" },
  { name: "Siesta reparadora", status: "En espera", cls: "amber" },
];

const TIME_CHIPS = [
  { label: "45 min", tag: "Mín", color: "#22C55E" },
  { label: "50 min", tag: "Rec", color: "#6366F1" },
  { label: "1 h", tag: "Máx", color: "#6366F1" },
];

const RECOMMENDATION_CARDS = [
  { name: "Revisar presupuesto", icon: "Wallet", color: "#F59E0B", cat: "Finanzas", min: 50, diff: "Moderada", top: true },
  { name: "Planificar finanzas", icon: "TrendingUp", color: "#22C55E", cat: "Finanzas", min: 50, diff: "Moderada" },
  { name: "Yoga", icon: "Flower", color: "#D946EF", cat: "Salud", min: 50, diff: "Moderada" },
];

const PLAN_ITEMS_DETAIL = [
  { name: "Aprender", icon: "BookOpen", color: "#6366F1", count: 2, items: [
    { name: "Programación", icon: "Code2", color: "#6366F1" },
    { name: "Inglés", icon: "Languages", color: "#38BDF8" },
  ] },
  { name: "Salud", icon: "HeartPulse", color: "#16A34A", count: 3, items: null },
  { name: "Entrenamiento", icon: "Dumbbell", color: "#D946EF", count: 3, items: null },
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

      {/* Mini modal de temas flotante */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
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

      {/* Imagen de fondo */}
      <div className="overflow-hidden rounded-3xl border border-border bg-background p-4 pb-6 shadow-2xl sm:p-4 sm:pb-6">
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
            {/* Fila 1: Home + Actividades */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Home compacta */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
              >
                <p className="text-xs font-bold text-foreground">Home</p>
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
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tus categorías</p>
                <div className="flex flex-col gap-1.5">
                  {CATEGORY_TABS.slice(0, 2).map((c) => (
                    <div key={c.name} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
                      <span className="flex size-5 items-center justify-center rounded" style={{ backgroundColor: `${c.color}22`, color: c.color }}>
                        <DynamicIcon name={c.icon} className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-foreground">{c.name}</span>
                      <ChevronDown className="size-3 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Actividades — vista imagen 1 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
              >
                <p className="text-xs font-bold text-foreground">Tus Actividades</p>
                {/* Tabs de categorías */}
                <div className="flex flex-wrap gap-1">
                  {ACTIVITY_CATEGORIES.map((c, i) => (
                    <span
                      key={c}
                      className={cn(
                        "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-medium",
                        i === 0 ? "border-foreground bg-foreground text-background" : "border-border bg-surface text-foreground",
                      )}
                    >
                      {c}
                      <Pencil className="size-2.5" />
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-accent-aprender px-2 py-1.5 text-white">
                  <Plus className="size-3" />
                  <span className="text-[9px] font-semibold">Crear Nueva categoría</span>
                </div>
                {/* Filtro */}
                <div className="rounded-lg border border-border bg-surface p-1.5">
                  <p className="flex items-center gap-1 text-[9px] font-semibold text-foreground">
                    <ListChecks className="size-3 text-accent-aprender" />
                    Filtrar actividades
                  </p>
                  <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {["Dificultad", "Estado de ánimo / energía"].map((f) => (
                      <div key={f} className="flex items-center justify-between rounded-md border border-border bg-surface-muted px-1.5 py-1">
                        <span className="truncate text-[8px] text-muted-foreground">{f}</span>
                        <ChevronDown className="size-2.5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Búsqueda */}
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5">
                  <Search className="size-3 shrink-0 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">Buscar actividad...</span>
                </div>
                {/* Cards de actividades */}
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {ACTIVITY_CARDS.slice(0, 2).map((a) => (
                    <div key={a.name} className="rounded-lg border border-border bg-surface p-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded" style={{ backgroundColor: `${a.color}22`, color: a.color }}>
                          <DynamicIcon name={a.icon} className="size-3" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-foreground">{a.name}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-1">
                        <span className="rounded-full bg-accent-aprender/10 px-1.5 py-0.5 text-[8px] font-semibold text-accent-aprender">
                          {a.difficulty}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[House, Play, Pencil, Trash2].map((Icon, ii) => (
                            <Icon key={ii} className="size-2.5 text-muted-foreground" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Fila 2: Planificación + Personalización (imagen 2) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
            >
              <p className="text-xs font-bold text-foreground">Personalizar experiencia</p>
              <p className="text-[9px] text-muted-foreground">
                Elige tus categorías, actividades, niveles de energía y tiempos ideales.
              </p>
              {/* Tabs: Categorías / Actividades / Recomendaciones */}
              <div className="flex gap-1">
                {[
                  { label: "Categorías", icon: Layers, active: false },
                  { label: "Actividades", icon: ListChecks, active: false },
                  { label: "Recomendaciones", icon: Wand2, active: true },
                ].map((t) => (
                  <span
                    key={t.label}
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-medium",
                      t.active ? "border-foreground bg-foreground text-background" : "border-border bg-surface text-foreground",
                    )}
                  >
                    <t.icon className="size-3" />
                    {t.label}
                  </span>
                ))}
              </div>

              <p className="text-[10px] font-bold text-foreground">Personaliza tus recomendaciones, a tu gusto</p>

              {/* Energía */}
              <div className="grid grid-cols-3 gap-1">
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
                      <span className="text-[9px] capitalize">{lvl}</span>
                    </div>
                  );
                })}
              </div>

              {/* Dificultad */}
              <div className="grid grid-cols-3 gap-1">
                {["Ligera", "Moderada", "Intensa"].map((d, i) => (
                  <div
                    key={d}
                    className={cn(
                      "rounded-lg border px-1 py-1 text-center text-[9px] font-semibold",
                      i === 1 ? "border-accent-aprender bg-accent-aprender/10 text-accent-aprender" : "border-border bg-surface text-foreground",
                    )}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Tiempos */}
              <p className="text-[9px] font-semibold text-foreground">
                Escoge tus tiempos para: Energía media + Dificultad moderada
              </p>
              <div className="flex flex-wrap items-center gap-1">
                {TIME_CHIPS.map((t) => (
                  <span key={t.label} className="flex items-center gap-1 rounded-full border border-border bg-surface px-1.5 py-1">
                    <span className="text-[9px] font-semibold text-foreground">{t.label}</span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[7px] font-bold text-white"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.tag}
                    </span>
                    <Pencil className="size-2.5 text-muted-foreground" />
                    <X className="size-2.5 text-muted-foreground" />
                  </span>
                ))}
                <span className="flex items-center gap-1 rounded-full border border-dashed border-border px-1.5 py-1 text-[8px] text-muted-foreground">
                  <Plus className="size-2.5" />
                  Agregar tiempo
                </span>
              </div>

              <p className="text-[10px] font-semibold text-foreground">
                ¿Qué actividades quieres recomendar para estos niveles?
              </p>
              {/* Plan del día (compartido) */}
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                {PLAN.map((p) => (
                  <div key={p.name} className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-1.5 py-1">
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

            {/* Fila 3: Planificación + Recomendaciones */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Planificación — ¡Hola Jorge! */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
              >
                <p className="text-xs font-bold text-foreground">Planificación</p>
                <p className="text-[9px] text-muted-foreground">Elige categorías y vincula las actividades que harás hoy</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tus categorías</p>
                <div className="flex flex-wrap gap-1">
                  {["Aprender", "Salud", "Entrenamiento", "Diversión", "Finanzas", "Descanso", "Trabajo"].map((c) => (
                    <span
                      key={c}
                      className="flex items-center gap-1 rounded-full border border-border bg-surface px-1.5 py-0.5 text-[8px] font-medium text-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <span className="flex items-center gap-1 text-[9px] font-medium text-accent-aprender">
                  <Plus className="size-3" />
                  Crear nueva categoría
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tu plan para hoy</p>
                <div className="flex flex-col gap-1.5">
                  {PLAN_ITEMS_DETAIL.map((c) => (
                    <div key={c.name} className="rounded-lg border border-border bg-surface">
                      <div className="flex items-center gap-2 px-2 py-1.5">
                        <span className="flex size-5 items-center justify-center rounded" style={{ backgroundColor: `${c.color}22`, color: c.color }}>
                          <DynamicIcon name={c.icon} className="size-3" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-foreground">{c.name}</span>
                        <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[8px] text-muted-foreground">{c.count}</span>
                        <ChevronDown className="size-3 text-muted-foreground" />
                        <span className="flex items-center gap-0.5 rounded-full border border-border bg-surface-muted px-1.5 py-0.5 text-[8px] text-red-500">
                          <Trash2 className="size-2.5" />
                          Eliminar todo
                        </span>
                      </div>
                      {c.items && (
                        <div className="flex flex-col border-t border-border">
                          {c.items.map((it) => (
                            <div key={it.name} className="flex items-center gap-2 border-b border-border px-2 py-1.5 last:border-b-0">
                              <span className="flex size-4 items-center justify-center rounded" style={{ backgroundColor: `${it.color}22`, color: it.color }}>
                                <DynamicIcon name={it.icon} className="size-2.5" />
                              </span>
                              <span className="min-w-0 flex-1 text-[9px] text-foreground">
                                {it.name}
                                <span className="ml-1 text-[7px] text-muted-foreground">· Actividad</span>
                              </span>
                              <Pencil className="size-2.5 text-muted-foreground" />
                              <Trash2 className="size-2.5 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-accent-aprender px-3 py-2 text-center text-[10px] font-semibold text-white">
                  Guardar planificación
                </div>
                <span className="flex items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-[9px] text-muted-foreground">
                  <CalendarCheck2 className="size-3" />
                  ¿Prefiero que me recomiendes algo?
                </span>
              </motion.div>

              {/* Recomendaciones por energía */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
              >
                <p className="text-xs font-bold text-foreground">Recomendaciones</p>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-2 py-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-green-500/15">
                      <BatteryMedium className="size-3 text-green-500" />
                    </span>
                    <span className="text-[9px] font-semibold text-foreground">Energía Media</span>
                  </span>
                  <span className="rounded-full border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">Cambiar energía</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                  {RECOMMENDATION_CARDS.map((r) => (
                    <div
                      key={r.name}
                      className={cn(
                        "flex flex-col gap-1 rounded-lg border bg-surface p-1.5",
                        r.top ? "border-accent-aprender/50 bg-accent-aprender/5" : "border-border",
                      )}
                    >
                      {r.top && (
                        <span className="self-start rounded-full bg-accent-aprender px-1.5 py-0.5 text-[7px] font-semibold text-white">
                          ⏱ Recomendada
                        </span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${r.color}22`, color: r.color }}>
                          <DynamicIcon name={r.icon} className="size-3" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[9px] font-semibold text-foreground">{r.name}</p>
                          <p className="truncate text-[8px] text-muted-foreground">{r.cat}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="rounded-full bg-accent-aprender/10 px-1.5 py-0.5 text-[7px] font-semibold text-accent-aprender">{r.min} min</span>
                        <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[7px] text-muted-foreground">{r.diff}</span>
                      </div>
                      <div className="mt-auto rounded-lg bg-accent-aprender px-2 py-1 text-center text-[8px] font-semibold text-white">
                        {r.top ? "▶ Empezar esta" : "▶ Empezar"}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Flechas de navegación + scrollbar */}
                <div className="flex items-center justify-between">
                  <span className="flex gap-1">
                    <span className="flex size-5 items-center justify-center rounded-full border border-border text-muted-foreground"><ChevronLeft className="size-3" /></span>
                    <span className="flex size-5 items-center justify-center rounded-full border border-border text-muted-foreground"><ChevronRight className="size-3" /></span>
                  </span>
                  <span className="h-1 flex-1 rounded-full bg-border">
                    <span className="block h-1 w-1/3 rounded-full bg-accent-aprender" />
                  </span>
                </div>

                {/* Input "¿Tienes algo más en mente?" */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-muted-foreground">¿Tienes algo más en mente? Escribelo aquí.</span>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5">
                    <span className="text-[9px] text-muted-foreground">ej: leer, estirar, revisar el presupuesto...</span>
                  </div>
                </div>

                {/* Ocultar todas mis opciones + categoría desplegable */}
                <div className="flex items-center gap-1 text-[9px] font-semibold text-foreground">
                  <span className="flex items-center gap-1"><ChevronDown className="size-3 text-muted-foreground" /> Ocultar todas mis opciones</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5">
                    <span className="flex size-5 items-center justify-center rounded" style={{ backgroundColor: `${CATEGORY_TABS[0].color}22`, color: CATEGORY_TABS[0].color }}>
                      <DynamicIcon name={CATEGORY_TABS[0].icon} className="size-3" />
                    </span>
                    <span className="min-w-0 flex-1 text-[10px] font-medium text-foreground">Aprender</span>
                    <span className="text-[8px] text-muted-foreground">16 actividades</span>
                    <ChevronDown className="size-3 text-muted-foreground" />
                    <Plus className="size-3 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ACTIVITY_CARDS.slice(0, 2).map((a) => (
                      <div key={a.name} className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-1.5 py-1.5">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded" style={{ backgroundColor: `${a.color}22`, color: a.color }}>
                          <DynamicIcon name={a.icon} className="size-3" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[9px] font-medium text-foreground">{a.name}</span>
                          <span className="block text-[7px] text-muted-foreground">Aprender</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-accent-aprender/10 px-1.5 py-0.5 text-[7px] font-semibold text-accent-aprender">
                          {a.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ACTIVITY_CATEGORIES = ["Aprender", "Salud", "Entrenamiento", "Diversión"];
