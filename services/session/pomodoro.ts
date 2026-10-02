import type { EnergyLevel } from "../recommendation/energy-level";

export type PomodoroPhase = "focus" | "break" | "done";

export type PomodoroConfig = {
  focusMin: number;
  breakMin: number;
  cycles: number;
  /**
   * Fase 2B: false = aviso manual al terminar cada fase (defecto seguro,
   * evita fases fantasma); true = la siguiente fase arranca sola.
   * Configurable por el usuario, nunca impuesto.
   */
  autoStart: boolean;
};

export type PomodoroView = {
  phase: PomodoroPhase;
  /** Índice 0-based del ciclo en curso; `cycles` cuando phase es done. */
  cycleIndex: number;
  phaseElapsedMs: number;
  phaseRemainingMs: number;
  totalFocusMs: number;
  focusDoneMs: number;
};

/**
 * Presets por energía (decisión 2A): foco total 100/150/150 min.
 * Ciclos cortos para energía baja, sesiones largas y pocas para alta.
 */
export const POMODORO_PRESETS: Record<EnergyLevel, PomodoroConfig> = {
  baja: { focusMin: 25, breakMin: 5, cycles: 4, autoStart: false },
  media: { focusMin: 50, breakMin: 10, cycles: 3, autoStart: false },
  alta: { focusMin: 75, breakMin: 15, cycles: 2, autoStart: false },
};

/**
 * Minutos planificados (reloj total) de un programa pomodoro:
 * foco total + descansos intermedios (sin descanso final).
 */
export function pomodoroPlannedMinutes(config: PomodoroConfig): number {
  return config.cycles * config.focusMin + (config.cycles - 1) * config.breakMin;
}

/**
 * Deriva la vista pomodoro desde ms activos (sin pausas). Pura y testeable.
 *
 * Decisiones aplicadas: fin tras N ciclos (sin descanso final); `extraFocusMs`
 * (extender, suma al foco) alarga la ÚLTIMA fase de foco —stateless y
 * predecible—. `autoStart` viaja en el config para 2B, no cambia el cálculo.
 */
export function derivePomodoroView(
  elapsedActiveMs: number,
  config: PomodoroConfig,
  extraFocusMs = 0,
): PomodoroView {
  const { focusMin, breakMin, cycles } = config;
  if (!Number.isFinite(focusMin) || focusMin <= 0) throw new RangeError("focusMin inválido.");
  if (!Number.isFinite(breakMin) || breakMin <= 0) throw new RangeError("breakMin inválido.");
  if (!Number.isInteger(cycles) || cycles < 1) throw new RangeError("cycles inválido.");
  if (!Number.isFinite(extraFocusMs) || extraFocusMs < 0) {
    throw new RangeError("extraFocusMs inválido.");
  }

  const focusMs = focusMin * 60_000;
  const breakMs = breakMin * 60_000;
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
      };
    }
    remaining -= thisFocus;
    focusDoneMs += thisFocus;
    if (i < cycles - 1) {
      if (remaining < breakMs) {
        return {
          phase: "break",
          cycleIndex: i,
          phaseElapsedMs: remaining,
          phaseRemainingMs: breakMs - remaining,
          totalFocusMs,
          focusDoneMs,
        };
      }
      remaining -= breakMs;
    }
  }

  return {
    phase: "done",
    cycleIndex: cycles,
    phaseElapsedMs: 0,
    phaseRemainingMs: 0,
    totalFocusMs,
    focusDoneMs,
  };
}
