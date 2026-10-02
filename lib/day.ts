/** Clave de día local (YYYY-MM-DD) para guardas por día. */
export function todayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Inicio del día (00:00 UTC) correspondiente a `date` en la zona horaria
 * indicada. Independiente del TZ del servidor: en Vercel (UTC) un usuario
 * en Lima a las 20:00 sigue viendo su día Lima, no el día UTC siguiente.
 * Puro y testeable: recibe instantes fijos, no lee el reloj.
 */
export function dayStartUtcInTimeZone(date: Date, timeZone: string): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const [year, month, day] = parts.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
