/** Soft, short tones via Web Audio API-no binary asset to ship. */

let sharedContext: AudioContext | null = null;

function getAudioContextClass(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  );
}

function getContext(): AudioContext | null {
  if (!sharedContext) {
    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return null;
    sharedContext = new AudioContextClass();
  }
  return sharedContext;
}

/**
 * Debe llamarse dentro de un gesto del usuario (p. ej. al iniciar una sesión)
 * para "desbloquear" el audio. Los navegadores (sobre todo desktop) bloquean
 * el AudioContext hasta la primera interacción; sin esto, la alarma de fin de
 * sesión no sonaría.
 */
export function unlockAudioContext() {
  const ctx = getContext();
  if (ctx && ctx.state === "suspended") {
    void ctx.resume();
  }
}

function playTones(frequencies: number[], noteDurationSec: number) {
  try {
    const ctx = getContext();
    if (!ctx) return;

    frequencies.forEach((frequency, index) => {
      const startAt = ctx.currentTime + index * noteDurationSec;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.15, startAt + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + noteDurationSec);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + noteDurationSec);
    });
    // Nota: no cerramos el contexto compartido (los osciladores ya se
    // auto-detienen al llegar a `oscillator.stop`).
  } catch {
    // Audio is an optional nicety-never let it break the session flow.
  }
}

/** Fired when a session reaches its planned time. */
export function playSoftCompletionSound() {
  playTones([660], 0.6);
}

/**
 * Reproduces an audible alarm (chime) that repeats for `durationSec` seconds,
 * so the user notices the session finished. Stops early via the returned
 * callback. No-op if Web Audio is unavailable.
 */
export function playCompletionAlarm(durationSec: number): () => void {
  const ctx = getContext();
  if (!ctx) return () => {};
  // Reanuda por si el navegador lo dejó suspendido (autoplay policy).
  if (ctx.state === "suspended") void ctx.resume();

  let stopped = false;

  try {
    const beep = () => {
      if (!ctx || stopped) return;
      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.4);
    };

    // Primer pitido y luego un intervalo repetitivo.
    beep();
    const interval = setInterval(beep, 700);
    const timeout = setTimeout(() => stop(), durationSec * 1000);

    function stop() {
      if (stopped) return;
      stopped = true;
      clearInterval(interval);
      clearTimeout(timeout);
    }

    return stop;
  } catch {
    return () => {};
  }
}

/** Fired the moment a session actually starts (after any countdown). */
export function playSoftStartSound() {
  playTones([440, 660], 0.18);
}

/** Fired alongside the completion sound. No-op on platforms without the
 * Vibration API (notably iOS Safari-there is no web workaround for that). */
export function vibrateOnCompletion() {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate([120, 60, 120]);
  } catch {
    // Ignore-vibration is an optional nicety.
  }
}
