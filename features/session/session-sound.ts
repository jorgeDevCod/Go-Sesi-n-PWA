/** Soft, short tones via Web Audio API-no binary asset to ship. */

function getAudioContextClass(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  );
}

function playTones(frequencies: number[], noteDurationSec: number) {
  try {
    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

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

    const totalDurationMs = frequencies.length * noteDurationSec * 1000;
    setTimeout(() => void ctx.close(), totalDurationMs + 100);
  } catch {
    // Audio is an optional nicety-never let it break the session flow.
  }
}

/** Fired when a session reaches its planned time. */
export function playSoftCompletionSound() {
  playTones([660], 0.6);
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
