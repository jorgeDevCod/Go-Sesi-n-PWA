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
 * Sonido de viento: ruido filtrado (lowpass) con la frecuencia y el volumen
 * modulados lentamente, generando ráfagas orgánicas y suaves. Se mantiene
 * durante `durationSec` segundos; devuelve un callback para detenerlo antes
 * de tiempo. No-op si Web Audio no está disponible.
 */
export function playCompletionAlarm(durationSec: number): () => void {
  const ctx = getContext();
  if (!ctx) return () => {};
  const ac: AudioContext = ctx;
  // Reanuda por si el navegador lo dejó suspendido (autoplay policy).
  if (ac.state === "suspended") void ac.resume();

  let stopped = false;

  // Buffer de ruido blanco (2s) cacheado para alimentar el viento.
  let noiseBuffer: AudioBuffer | null = null;
  function getNoiseBuffer(): AudioBuffer | null {
    if (noiseBuffer) return noiseBuffer;
    const length = Math.floor(ac.sampleRate * 2);
    noiseBuffer = ac.createBuffer(1, length, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }

  try {
    const buffer = getNoiseBuffer();
    if (!buffer) return () => {};

    const noise = ac.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filtro lowpass: suaviza el ruido para que suene a viento, no a estática.
    const lowpass = ac.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 900;
    lowpass.Q.value = 0.5;

    const windGain = ac.createGain();
    windGain.gain.value = 0.0;

    noise.connect(lowpass);
    lowpass.connect(windGain);
    windGain.connect(ac.destination);

    // LFO que abre/cierra el filtro lentamente: da el "aire" variable del viento.
    const cutLfo = ac.createOscillator();
    cutLfo.type = "sine";
    cutLfo.frequency.value = 0.4;
    const cutDepth = ac.createGain();
    cutDepth.gain.value = 500;
    cutLfo.connect(cutDepth);
    cutDepth.connect(lowpass.frequency);

    // Segundo LFO (más lento) que modula el volumen: crea ráfagas orgánicas.
    const volLfo = ac.createOscillator();
    volLfo.type = "sine";
    volLfo.frequency.value = 0.18;
    const volDepth = ac.createGain();
    volDepth.gain.value = 0.1;
    volLfo.connect(volDepth);
    volDepth.connect(windGain.gain);

    const start = ac.currentTime;
    // Fundido de entrada y salida suaves; nivel máximo moderado.
    windGain.gain.setValueAtTime(0.0001, start);
    windGain.gain.linearRampToValueAtTime(0.18, start + 1.2);
    windGain.gain.setTargetAtTime(0.16, start + 1.5, 1.5);
    windGain.gain.setValueAtTime(0.18, start + durationSec - 1.2);
    windGain.gain.linearRampToValueAtTime(0.0001, start + durationSec);

    noise.start(start);
    cutLfo.start(start);
    volLfo.start(start);

    const fadeTimeout: ReturnType<typeof setTimeout> | undefined =
      // Apaga los nodos justo tras el fade-out para no dejar recursos vivos.
      setTimeout(() => {
        noise.stop();
        cutLfo.stop();
        volLfo.stop();
      }, durationSec * 1000 + 100);
    function stop() {
      if (stopped) return;
      stopped = true;
      try {
        const now = ac.currentTime;
        windGain.gain.cancelScheduledValues(now);
        windGain.gain.setTargetAtTime(0.0001, now, 0.05);
      } catch {
        // Ignorar; solo intentamos detener el sonido limpiamente.
      }
      setTimeout(() => {
        try {
          noise.stop();
          cutLfo.stop();
          volLfo.stop();
        } catch {
          // Ya detenidos.
        }
      }, 150);
      if (fadeTimeout) clearTimeout(fadeTimeout);
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
    // Vibración breve y tenue, sin el patron 120/60/120 (demasiado brusco).
    navigator.vibrate(400);
  } catch {
    // Ignore-vibration is an optional nicety.
  }
}
