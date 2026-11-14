"use client";

import { areSoundsEnabled } from "@/features/session/sound-preferences";

export type SessionSoundName =
  | "focus-start"
  | "focus-complete"
  | "break-ending"
  | "break-complete"
  | "cycles-complete"
  | "session-complete"
  | "planning-reminder";

const SOURCES: Record<SessionSoundName, string> = {
  "focus-start": "/sounds/focus-start.wav",
  "focus-complete": "/sounds/focus-complete.wav",
  "break-ending": "/sounds/break-ending.wav",
  "break-complete": "/sounds/break-complete.wav",
  "cycles-complete": "/sounds/cycles-complete.wav",
  "session-complete": "/sounds/session-complete.wav",
  "planning-reminder": "/sounds/planning-reminder.wav",
};

const cache = new Map<SessionSoundName, HTMLAudioElement>();
let active: HTMLAudioElement | null = null;
let unlocked = false;

function audioFor(name: SessionSoundName): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  let audio = cache.get(name);
  if (!audio) {
    audio = new Audio(SOURCES[name]);
    audio.preload = "auto";
    audio.volume = 0.75;
    cache.set(name, audio);
  }
  return audio;
}

/** Desbloquea el audio dentro de un gesto del usuario (iOS/Safari). */
export function unlockSessionSounds() {
  if (unlocked || typeof Audio === "undefined") return;
  unlocked = true;
  for (const name of Object.keys(SOURCES) as SessionSoundName[]) {
    const audio = audioFor(name);
    if (!audio) continue;
    const originalVolume = audio.volume;
    audio.volume = 0;
    void audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = originalVolume;
      })
      .catch(() => {
        audio.volume = originalVolume;
      });
  }
}

export function preloadSessionSounds() {
  for (const name of Object.keys(SOURCES) as SessionSoundName[]) audioFor(name);
}

export function stopSessionSound() {
  if (!active) return;
  try {
    active.pause();
    active.currentTime = 0;
  } catch {
    // Ignore.
  }
  active = null;
}

export function playSessionSound(name: SessionSoundName) {
  if (!areSoundsEnabled()) return;
  const audio = audioFor(name);
  if (!audio) return;

  stopSessionSound();
  try {
    audio.currentTime = 0;
    active = audio;
    void audio.play().catch(() => {
      if (active === audio) active = null;
    });
  } catch {
    // Best-effort.
  }
}
