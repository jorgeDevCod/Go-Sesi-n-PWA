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
 * Radio AM de los 90: estática de banda con una armonía tenue que entra
 * y sale entre "estaciones", repetitiva pero con volumen moderado.
 * Reproduce durante `durationSec` segundos; devuelve un callback para
 * detenerla antes de tiempo. No-op si Web Audio no está disponible.
 */
export function playCompletionAlarm(durationSec: number): () => void {
  const ctx = getContext();
  if (!ctx) return () => {};
  // Reanuda por si el navegador lo dejó suspendido (autoplay policy).
  if (ctx.state === "suspended") void ctx.resume();

  // Buffer de ruido blanco (~1.5s) cacheado para reusar entre ciclos.
  let noiseBuffer: AudioBuffer | null = null;
  function getNoiseBuffer(): AudioBuffer | null {
    if (noiseBuffer) return noiseBuffer;
    if (!ctx) return null;
    const length = Math.floor(ctx.sampleRate * 1.5);
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }

  // Acorde consonante (C mayor suave).
  const CHORD = [261.63, 329.63, 392.0]; // C4 E4 G4
  const CHORD_FADE = 0.9;

  let stopped = false;

  function playRadioCycle() {
    if (!ctx || stopped) return;
    const now = ctx.currentTime;

    // --- Estática AM (ruido blanco a través de un bandpass) ---
    const buffer = getNoiseBuffer();
    if (buffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 1000;
      bandpass.Q.value = 0.7;

      const noiseGain = ctx.createGain();
      // Envolvente suave de la ráfaga de estática (en y fuera).
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.1, now + 0.15);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_FADE);

      // Tremolo AM: seno de baja frecuencia modulando la estática.
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 7;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.05;
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 0.4;
      lfo.connect(lfoGain);
      lfoGain.connect(lfoDepth);
      lfoDepth.connect(noiseGain.gain);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + CHORD_FADE + 0.1);
      lfo.start(now);
      lfo.stop(now + CHORD_FADE + 0.1);
    }

    // --- Armonía tenue (acorde que asoma entre la estática) ---
    CHORD.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.08, now + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_FADE);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + CHORD_FADE + 0.1);
    });
  }

  try {
    // Repetir cada ~900 ms durante la duración indicada.
    playRadioCycle();
    const interval = setInterval(playRadioCycle, 900);
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
