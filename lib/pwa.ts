/** Detecta si la app corre como PWA instalada (standalone), no como pestaña web. */
export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const modes = ["(display-mode: standalone)", "(display-mode: minimal-ui)"];
    const displayMode =
      typeof window.matchMedia === "function" &&
      modes.some((query) => window.matchMedia(query).matches);
    const iosStandalone =
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    return displayMode || iosStandalone;
  } catch {
    return false;
  }
}
