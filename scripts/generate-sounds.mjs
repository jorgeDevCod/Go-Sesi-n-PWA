import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SAMPLE_RATE = 44100;
const OUT_DIR = join(process.cwd(), "public", "sounds");

function envelope(t, duration, attack = 0.015, release = 0.18) {
  if (t < attack) return t / attack;
  if (t > duration - release) return Math.max(0, (duration - t) / release);
  return 1;
}

function render(notes, duration) {
  const length = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(length);

  for (const note of notes) {
    const start = Math.floor(note.start * SAMPLE_RATE);
    const noteDuration = note.duration;
    const noteLength = Math.floor(noteDuration * SAMPLE_RATE);
    for (let i = 0; i < noteLength; i += 1) {
      const index = start + i;
      if (index >= length) break;
      const t = i / SAMPLE_RATE;
      const env = envelope(t, noteDuration, note.attack ?? 0.015, note.release ?? 0.18);
      const vibrato = 1 + 0.003 * Math.sin(2 * Math.PI * 5 * t);
      let value = 0;
      value += Math.sin(2 * Math.PI * note.freq * vibrato * t);
      value += 0.32 * Math.sin(2 * Math.PI * note.freq * 2 * t);
      value += 0.12 * Math.sin(2 * Math.PI * note.freq * 3 * t);
      samples[index] += value * env * (note.gain ?? 0.22);
    }
  }

  const data = Buffer.alloc(44 + length * 2);
  data.write("RIFF", 0);
  data.writeUInt32LE(36 + length * 2, 4);
  data.write("WAVE", 8);
  data.write("fmt ", 12);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(SAMPLE_RATE, 24);
  data.writeUInt32LE(SAMPLE_RATE * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(length * 2, 40);

  for (let i = 0; i < length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  return data;
}

const sounds = {
  "focus-start": {
    duration: 1.1,
    notes: [
      { freq: 523.25, start: 0, duration: 0.45, gain: 0.18 },
      { freq: 659.25, start: 0.18, duration: 0.5, gain: 0.16 },
      { freq: 783.99, start: 0.38, duration: 0.6, gain: 0.14 },
    ],
  },
  "focus-complete": {
    duration: 1.5,
    notes: [
      { freq: 659.25, start: 0, duration: 0.55, gain: 0.24 },
      { freq: 880, start: 0.32, duration: 0.75, gain: 0.22 },
      { freq: 1046.5, start: 0.62, duration: 0.8, gain: 0.16 },
    ],
  },
  "break-ending": {
    duration: 1.2,
    notes: [
      { freq: 880, start: 0, duration: 0.14, gain: 0.24, release: 0.05 },
      { freq: 880, start: 0.38, duration: 0.14, gain: 0.24, release: 0.05 },
      { freq: 987.77, start: 0.76, duration: 0.3, gain: 0.22 },
    ],
  },
  "break-complete": {
    duration: 1.4,
    notes: [
      { freq: 783.99, start: 0, duration: 0.4, gain: 0.2 },
      { freq: 659.25, start: 0.22, duration: 0.5, gain: 0.2 },
      { freq: 523.25, start: 0.46, duration: 0.8, gain: 0.2 },
    ],
  },
  "cycles-complete": {
    duration: 2.2,
    notes: [
      { freq: 523.25, start: 0, duration: 0.55, gain: 0.2 },
      { freq: 659.25, start: 0.25, duration: 0.55, gain: 0.2 },
      { freq: 783.99, start: 0.5, duration: 0.55, gain: 0.2 },
      { freq: 1046.5, start: 0.8, duration: 1.2, gain: 0.22 },
      { freq: 1318.5, start: 1.1, duration: 0.9, gain: 0.12 },
    ],
  },
  "session-complete": {
    duration: 1.8,
    notes: [
      { freq: 440, start: 0, duration: 0.55, gain: 0.22 },
      { freq: 659.25, start: 0.24, duration: 0.65, gain: 0.2 },
      { freq: 880, start: 0.52, duration: 1.1, gain: 0.2 },
    ],
  },
  "planning-reminder": {
    duration: 1.3,
    notes: [
      { freq: 784, start: 0, duration: 0.35, gain: 0.2 },
      { freq: 987.77, start: 0.3, duration: 0.7, gain: 0.18 },
    ],
  },
};

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, spec] of Object.entries(sounds)) {
  const data = render(spec.notes, spec.duration);
  writeFileSync(join(OUT_DIR, `${name}.wav`), data);
  console.log(`wrote public/sounds/${name}.wav (${data.length} bytes)`);
}
