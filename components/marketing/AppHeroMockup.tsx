"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BatteryMedium,
  CalendarCheck2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History,
  House,
  Layers,
  ListChecks,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
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

const MENU_ITEMS = [
  { label: "Inicio", icon: House },
  { label: "Planificación", icon: CalendarCheck2 },
  { label: "Actividades", icon: Settings2 },
  { label: "Historial", icon: History },
  { label: "Papelera", icon: Trash2 },
  { label: "Personalizar", icon: SlidersHorizontal },
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

const TIME_CHIPS = [
  { label: "45 min", tag: "Mín", color: "#22C55E" },
  { label: "50 min", tag: "Rec", color: "#6366F1" },
  { label: "1 h", tag: "Máx", color: "#6366F1" },
];

export function AppHeroMockup() {
  // Solo un panel abierto a la vez. El de temas arranca abierto para mostrar
  // la capacidad de cerrarlo con una X e interactuar.
  const [menuOpen, setMenuOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(true);

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Etiquetas flotantes de funciones — solo visible en pantallas grandes */}
      <div className="pointer-events-none absolute -top-4 left-1/2 z-10 hidden w-auto -translate-x-1/2 flex-wrap justify-center gap-2 lg:top-0 lg:flex">
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

      {/* Imagen de fondo */}
      <div className="overflow-x-auto rounded-3xl border border-border bg-background p-4 pb-6 shadow-2xl sm:p-4 sm:pb-6">
        <div className="mx-auto min-w-[1040px] w-full max-w-5xl rounded-2xl border border-border bg-surface shadow-inner">
          {/* Encabezado tipo app */}
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <Logo showWordmark />
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10px] font-medium text-muted-foreground sm:flex">
                <BatteryMedium className="size-3 text-accent-aprender" />
                Media
              </span>
              <span className="flex size-6 items-center justify-center rounded-full bg-accent-aprender/15 text-[10px] font-semibold text-accent-aprender">
                G
              </span>

              {/* Toggle de temas interactivo */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setThemesOpen((v) => !v);
                  }}
                  aria-label="Cambiar tema"
                  className="flex size-6 cursor-pointer items-center justify-center rounded-full border border-border transition-colors hover:bg-surface-hover"
                >
                  <span className="grid size-4 grid-cols-2 overflow-hidden rounded-full border border-border/60">
                    <span style={{ backgroundColor: "#29292E" }} />
                    <span style={{ backgroundColor: "#FAFAFA" }} />
                    <span style={{ backgroundColor: "#8995D8" }} />
                    <span style={{ backgroundColor: "#F2A9C4" }} />
                  </span>
                </button>
                <AnimatePresence>
                  {themesOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 8 }}
                      className="absolute right-0 top-8 z-30 w-32 rounded-xl border border-border bg-surface p-1.5 shadow-lg"
                    >
                      <div className="mb-1 flex items-center justify-between px-1">
                        <span className="text-[8px] font-semibold uppercase text-accent-aprender">Temas</span>
                        <button
                          type="button"
                          onClick={() => setThemesOpen(false)}
                          aria-label="Cerrar temas"
                          className="flex size-4 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                      {THEMES.map((t) => (
                        <div key={t.label} className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-1.5 py-1">
                          <span className="size-3 rounded-full border border-border" style={{ backgroundColor: t.color }} />
                          <span className="text-[8px] text-foreground">{t.label}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Menú hamburguesa interactivo */}
              <button
                type="button"
                onClick={() => {
                  setThemesOpen(false);
                  setMenuOpen(true);
                }}
                aria-label="Abrir menú"
                className="flex size-6 cursor-pointer items-center justify-center rounded-full border border-border transition-colors hover:bg-surface-hover min-[730px]:hidden"
              >
                <Menu className="size-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
            {/* Fila 1: Home + Actividades */}
            {/* Home compacta */}
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3">
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
              </div>

              {/* Actividades */}
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3">
                <p className="text-xs font-bold text-foreground">Tus Actividades</p>
                <div className="flex flex-wrap gap-1">
                  {["Aprender", "Salud", "Entrenamiento", "Diversión"].map((c, i) => (
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
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5">
                  <Search className="size-3 shrink-0 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">Buscar actividad...</span>
                </div>
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
              </div>

            {/* Fila 2: Planificación + Recomendaciones */}
              {/* Planificación */}
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3">
                <p className="text-xs font-bold text-foreground">Planificación</p>
                <p className="text-[9px] text-muted-foreground">Elige categorías y vincula las actividades que harás hoy</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tus categorías</p>
                <div className="flex flex-wrap gap-1">
                  {["Aprender", "Salud", "Entrenamiento", "Diversión", "Finanzas", "Descanso", "Trabajo"].map((c) => (
                    <span key={c} className="flex items-center gap-1 rounded-full border border-border bg-surface px-1.5 py-0.5 text-[8px] font-medium text-foreground">
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
              </div>

              {/* Recomendaciones */}
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3">
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
                <div className="flex items-center justify-between">
                  <span className="flex gap-1">
                    <span className="flex size-5 items-center justify-center rounded-full border border-border text-muted-foreground"><ChevronLeft className="size-3" /></span>
                    <span className="flex size-5 items-center justify-center rounded-full border border-border text-muted-foreground"><ChevronRight className="size-3" /></span>
                  </span>
                  <span className="h-1 flex-1 rounded-full bg-border">
                    <span className="block h-1 w-1/3 rounded-full bg-accent-aprender" />
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-muted-foreground">¿Tienes algo más en mente? Escribelo aquí.</span>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5">
                    <span className="text-[9px] text-muted-foreground">ej: leer, estirar, revisar el presupuesto...</span>
                  </div>
                </div>
              </div>

            {/* Fila 3: Personalizar experiencia */}
            <div className="flex min-w-[85%] shrink-0 snap-center flex-col gap-2 rounded-xl border-2 border-border bg-background p-3 min-[640px]:min-w-0 min-[640px]:shrink min-[640px]:border min-[640px]:border-border">
              <p className="text-xs font-bold text-foreground">Personalizar experiencia</p>
              <p className="text-[9px] text-muted-foreground">
                Elige tus categorías, actividades, niveles de energía y tiempos ideales.
              </p>
              <div className="flex gap-1 justify-center">
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
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
                <div className="flex items-center gap-1">
                  {TIME_CHIPS.map((t) => (
                    <span key={t.label} className="flex items-center gap-1 rounded-full border border-border bg-surface px-1.5 py-1">
                      <span className="text-[9px] font-semibold text-foreground">{t.label}</span>
                      <span className="rounded-full px-1.5 py-0.5 text-[7px] font-bold text-white" style={{ backgroundColor: t.color }}>
                        {t.tag}
                      </span>
                      <Pencil className="size-2.5 text-muted-foreground" />
                      <X className="size-2.5 text-muted-foreground" />
                    </span>
                  ))}
                  <span className="flex items-center gap-1 rounded-full border border-dashed border-border px-1.5 py-1 text-[8px] text-muted-foreground">
                    <Plus className="size-2.5" />
                    Agregar
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menú lateral (idéntico al MobileMenu), abre en <730px */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMenuOpen(false)}
            role="presentation"
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              onClick={(event) => event.stopPropagation()}
              className="absolute right-0 top-0 flex h-full w-[82%] max-w-xs flex-col gap-1.5 border-l border-border bg-surface p-3 shadow-xl"
            >
              <div className="mb-1 flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              {MENU_ITEMS.map((item) => (
                <span
                  key={item.label}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 text-[11px] font-medium text-foreground"
                >
                  <item.icon className="size-3.5 text-muted-foreground" />
                  {item.label}
                </span>
              ))}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
