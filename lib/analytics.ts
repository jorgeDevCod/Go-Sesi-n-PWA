type AnalyticsEvent = {
  event: string;
  [key: string]: unknown;
};

/**
 * Registra eventos en GA4 (`window.gtag`) y Vercel Analytics (`window.va.track`)
 * cuando están disponibles. No lanza errores si no hay SDK cargado.
 */
export function track(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  const payload: AnalyticsEvent = { event, ...params };

  try {
    // GA4
    const gtag = (window as unknown as { gtag?: (cmd: string, event: string, p: AnalyticsEvent) => void }).gtag;
    if (typeof gtag === "function") {
      gtag("event", event, payload);
    }
  } catch {
    // Analytics no disponible.
  }

  try {
    // Vercel Analytics
    const va = (window as unknown as { va?: (cmd: string, p: { name: string; data?: Record<string, unknown> }) => void }).va;
    if (typeof va === "function") {
      va("track", { name: event, data: params });
    }
  } catch {
    // Analytics no disponible.
  }
}
