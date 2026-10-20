import type { EnergyLevel } from "../recommendation/energy-level";
import type { Complexity } from "@/lib/constants/default-subcategories";

export type PomodoroPhase = "focus" | "break" | "done";

export type PomodoroConfig = {
  focusMin: number;
  breakMin: number;
  cycles: number;
  /**
   * false = aviso manual al terminar el foco (pregunta antes del descanso);
   * true = la siguiente fase arranca sola. Configurable por el usuario.
   */
  autoStart: boolean;
  /** Descanso largo tras el último ciclo (0 = desactivado). */
  longBreakMin?: number;
  /** true = encadena los ciclos de foco sin fases de descanso. */
  skipBreaks?: boolean;
};

export type PomodoroView = {
  phase: PomodoroPhase;
  /** Índice 0-based del ciclo en curso; `cycles` cuando phase es done. */
  cycleIndex: number;
  phaseElapsedMs: number;
  phaseRemainingMs: number;
  totalFocusMs: number;
  focusDoneMs: number;
  /** True cuando la fase de descanso es el descanso largo final. */
  isLongBreak: boolean;
};

/**
 * Presets por energía (foco total 100/150/150 min): ciclos cortos para energía
 * baja, sesiones largas y pocas para alta. Son la base editable del usuario.
 */
export const POMODORO_PRESETS: Record<EnergyLevel, PomodoroConfig> = {
  baja: { focusMin: 25, breakMin: 5, cycles: 4, autoStart: false, longBreakMin: 0, skipBreaks: false },
  media: { focusMin: 50, breakMin: 10, cycles: 3, autoStart: false, longBreakMin: 0, skipBreaks: false },
  alta: { focusMin: 75, breakMin: 15, cycles: 2, autoStart: false, longBreakMin: 0, skipBreaks: false },
};

/**
 * Niveles pre-programados que se muestran al elegir Pomodoro. Cada uno es
 * editable por el usuario (Personalizar → Actividades).
 */
export const POMODORO_TIERS = ["ligero", "medio", "intenso"] as const;
export type PomodoroTier = (typeof POMODORO_TIERS)[number];

export const POMODORO_TIER_LABELS: Record<PomodoroTier, string> = {
  ligero: "Ligero",
  medio: "Medio",
  intenso: "Intenso",
};

export const POMODORO_TIER_DETAILS: Record<PomodoroTier, string> = {
  ligero: "Foco corto y constante",
  medio: "El punto medio clásico",
  intenso: "Retos exigentes",
};

/** Nivel pre-programado recomendado para cada energía. */
export const POMODORO_TIER_BY_ENERGY: Record<EnergyLevel, PomodoroTier> = {
  baja: "ligero",
  media: "medio",
  alta: "intenso",
};

export const POMODORO_TIER_PRESETS: Record<PomodoroTier, PomodoroConfig> = {
  ligero: POMODORO_PRESETS.baja,
  medio: POMODORO_PRESETS.media,
  intenso: POMODORO_PRESETS.alta,
};

/** Config editable del nivel (si el usuario lo ajustó) o el preset por defecto. */
export function pomodoroPresetFor(
  tier: PomodoroTier,
  saved?: Record<string, PomodoroConfig>,
): PomodoroConfig {
  return saved?.[tier] ?? POMODORO_TIER_PRESETS[tier];
}

/**
 * Lee un cronómetro guardado (JSON de la BD o de preferencias) de forma
 * defensiva: datos parciales o corruptos → null. Módulo puro (sin Prisma)
 * para poder usarse también en componentes cliente.
 */
export function parsePomodoroConfig(value: unknown): PomodoroConfig | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (
    !Number.isInteger(v.focusMin) ||
    !Number.isInteger(v.breakMin) ||
    !Number.isInteger(v.cycles) ||
    typeof v.autoStart !== "boolean"
  ) {
    return null;
  }
  return {
    focusMin: v.focusMin as number,
    breakMin: v.breakMin as number,
    cycles: v.cycles as number,
    autoStart: v.autoStart as boolean,
    longBreakMin: Number.isInteger(v.longBreakMin) ? (v.longBreakMin as number) : 0,
    skipBreaks: v.skipBreaks === true,
  };
}

/** Clave de almacenamiento por combinación energía × dificultad. */
export function pomodoroKey(energy: EnergyLevel, complexity: Complexity): string {
  return `${energy}:${complexity}`;
}

/**
 * Config efectiva de un combo energía × dificultad: la guardada por el
 * usuario o el preset de la energía.
 */
export function pomodoroConfigFor(
  energy: EnergyLevel,
  complexity: Complexity,
  saved?: Record<string, PomodoroConfig>,
): PomodoroConfig {
  return saved?.[pomodoroKey(energy, complexity)] ?? POMODORO_PRESETS[energy];
}

/**
 * Prioridad del cronómetro al abrir una actividad:
 * 1) el que el usuario guardó para esa actividad,
 * 2) el nivel pre-programado de la energía actual,
 * 3) el preset por defecto de la energía.
 */
export function resolvePomodoroConfigForStart(args: {
  activityConfig?: PomodoroConfig | null;
  energy: EnergyLevel;
  presets?: Record<string, PomodoroConfig>;
  savedCombos?: Record<string, PomodoroConfig>;
  complexity: Complexity;
}): PomodoroConfig {
  if (args.activityConfig) return args.activityConfig;
  const tier = POMODORO_TIER_BY_ENERGY[args.energy];
  // El nivel gana si el usuario lo personalizó; si no, mandan el combo
  // energía:dificultad y, en último caso, el preset del nivel.
  const savedTier = args.presets?.[tier];
  if (savedTier) return savedTier;
  const comboConfig = args.savedCombos?.[pomodoroKey(args.energy, args.complexity)];
  return comboConfig ?? POMODORO_TIER_PRESETS[tier];
}

/** Minutos planificados (reloj total) incluyendo descansos y descanso largo. */
export function pomodoroPlannedMinutes(config: PomodoroConfig): number {
  const longBreak = config.longBreakMin ?? 0;
  const breaks = config.skipBreaks ? 0 : (config.cycles - 1) * config.breakMin + longBreak;
  return config.cycles * config.focusMin + breaks;
}

/** Texto claro para explicar el plan de un vistazo. */
export function describePomodoroPlan(config: PomodoroConfig): string {
  const parts = [
    `${config.cycles} ${config.cycles === 1 ? "ciclo" : "ciclos"} de ${config.focusMin} min`,
  ];
  if (config.skipBreaks) {
    parts.push("sin descansos");
  } else {
    if (config.cycles > 1) {
      parts.push(`${config.cycles - 1} descansos de ${config.breakMin} min`);
    }
    const longBreak = config.longBreakMin ?? 0;
    if (longBreak > 0) parts.push(`descanso largo de ${longBreak} min`);
  }
  const total = pomodoroPlannedMinutes(config);
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  const totalText = hours > 0 ? `${hours} h${rest > 0 ? ` ${rest} min` : ""}` : `${rest} min`;
  return `${parts.join(" · ")} — ${totalText} en total`;
}

/**
 * Deriva la vista pomodoro desde ms activos (sin pausas). Pura y testeable.
 *
 * - Fin tras N ciclos; el descanso largo final (si hay) ocurre antes de "done".
 * - `skipBreaks` elimina las fases de descanso.
 * - `extraFocusMs` (extender) alarga la ÚLTIMA fase de foco.
 */
export function derivePomodoroView(
  elapsedActiveMs: number,
  config: PomodoroConfig,
  extraFocusMs = 0,
): PomodoroView {
  const { focusMin, breakMin, cycles } = config;
  const longBreakMin = config.longBreakMin ?? 0;
  const skipBreaks = config.skipBreaks ?? false;
  if (!Number.isFinite(focusMin) || focusMin <= 0) throw new RangeError("focusMin inválido.");
  if (!Number.isFinite(breakMin) || breakMin < 0) throw new RangeError("breakMin inválido.");
  if (!Number.isInteger(cycles) || cycles < 1) throw new RangeError("cycles inválido.");
  if (!Number.isFinite(longBreakMin) || longBreakMin < 0) {
    throw new RangeError("longBreakMin inválido.");
  }
  if (!Number.isFinite(extraFocusMs) || extraFocusMs < 0) {
    throw new RangeError("extraFocusMs inválido.");
  }

  const focusMs = focusMin * 60_000;
  const breakMs = breakMin * 60_000;
  const longBreakMs = longBreakMin * 60_000;
  const totalFocusMs = cycles * focusMs + extraFocusMs;
  let remaining = Math.max(0, elapsedActiveMs);
  let focusDoneMs = 0;

  for (let i = 0; i < cycles; i += 1) {
    const thisFocus = focusMs + (i === cycles - 1 ? extraFocusMs : 0);
    if (remaining < thisFocus) {
      return {
        phase: "focus",
        cycleIndex: i,
        phaseElapsedMs: remaining,
        phaseRemainingMs: thisFocus - remaining,
        totalFocusMs,
        focusDoneMs: focusDoneMs + remaining,
        isLongBreak: false,
      };
    }
    remaining -= thisFocus;
    focusDoneMs += thisFocus;

    const isLastCycle = i === cycles - 1;
    if (isLastCycle) break;

    if (!skipBreaks) {
      if (remaining < breakMs) {
        return {
          phase: "break",
          cycleIndex: i,
          phaseElapsedMs: remaining,
          phaseRemainingMs: breakMs - remaining,
          totalFocusMs,
          focusDoneMs,
          isLongBreak: false,
        };
      }
      remaining -= breakMs;
    }
  }

  // Tras el último foco: descanso largo (si aplica) y fin.
  if (!skipBreaks && longBreakMs > 0) {
    if (remaining < longBreakMs) {
      return {
        phase: "break",
        cycleIndex: cycles,
        phaseElapsedMs: remaining,
        phaseRemainingMs: longBreakMs - remaining,
        totalFocusMs,
        focusDoneMs,
        isLongBreak: true,
      };
    }
    remaining -= longBreakMs;
  }

  return {
    phase: "done",
    cycleIndex: cycles,
    phaseElapsedMs: 0,
    phaseRemainingMs: 0,
    totalFocusMs,
    focusDoneMs,
    isLongBreak: false,
  };
}
