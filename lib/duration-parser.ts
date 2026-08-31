export const MIN_MINUTES = 1;
export const MAX_MINUTES = 480;

function clampValid(totalMinutes: number): number | null {
  if (!Number.isFinite(totalMinutes)) return null;
  const rounded = Math.round(totalMinutes);
  if (rounded < MIN_MINUTES || rounded > MAX_MINUTES) return null;
  return rounded;
}

/**
 * Tolerant parser for manual duration input. Accepts "45", "45m", "1h",
 * "1h 25m", "1h25m", "1:25", "2 horas 10 minutos". Returns whole minutes,
 * or null when the input can't be confidently understood.
 */
export function parseDurationInput(raw: string): number | null {
  const input = raw.trim().toLowerCase();
  if (!input) return null;

  // Reject anything outside a safe charset up front (e.g. stray "-", "+").
  if (/[^a-z0-9:\s]/.test(input)) return null;

  const colonMatch = input.match(/^(\d{1,2}):([0-5]?\d)$/);
  if (colonMatch) {
    const hours = Number(colonMatch[1]);
    const minutes = Number(colonMatch[2]);
    return clampValid(hours * 60 + minutes);
  }

  if (/^\d+$/.test(input)) {
    return clampValid(Number(input));
  }

  const hourToken = input.match(/(\d+)\s*h(?:oras?)?/);
  const minuteToken = input.match(/(\d+)\s*m(?:in(?:utos?)?)?/);

  if (!hourToken && !minuteToken) return null;

  const hours = hourToken ? Number(hourToken[1]) : 0;
  const minutes = minuteToken ? Number(minuteToken[1]) : 0;

  return clampValid(hours * 60 + minutes);
}
