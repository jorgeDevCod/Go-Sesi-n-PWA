import { beforeEach, describe, expect, it } from "vitest";
import {
  clearMoodAnswered,
  hasShownMoodPromptThisSession,
  isMoodPromptSuppressedToday,
  markMoodPromptShownThisSession,
  suppressMoodPromptToday,
} from "./mood.storage";

describe("mood storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("suprime el modal solo cuando se marca", () => {
    expect(isMoodPromptSuppressedToday()).toBe(false);
    suppressMoodPromptToday();
    expect(isMoodPromptSuppressedToday()).toBe(true);
  });

  it("evita repetirlo en la misma apertura sin suprimirlo", () => {
    expect(hasShownMoodPromptThisSession()).toBe(false);
    markMoodPromptShownThisSession();
    expect(hasShownMoodPromptThisSession()).toBe(true);
    expect(isMoodPromptSuppressedToday()).toBe(false);
  });

  it("limpia ambos guards", () => {
    suppressMoodPromptToday();
    markMoodPromptShownThisSession();
    clearMoodAnswered();
    expect(isMoodPromptSuppressedToday()).toBe(false);
    expect(hasShownMoodPromptThisSession()).toBe(false);
  });
});
