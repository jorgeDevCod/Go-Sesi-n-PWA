const GREETING_TIME_ZONE = "America/Lima";

function currentDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: GREETING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export const HOME_GREETINGS = [
  "Bienvenido a tu propio espacio de enfoque total ⭐",
  "¡Este es tu espacio para avanzar a tu ritmo! 🚀",
  "Bienvenido a tu rincón de calma y concentración 🌿",
  "Tu espacio, tus metas, tu propio ritmo ✨",
  "¡Bienvenido a un espacio hecho para ti! 💛",
  "Aquí comienza tu momento de enfoque 🎯",
  "Bienvenido a tu lugar para crecer sin presión 🌱",
  "Este es tu momento, este es tu espacio 🌟",
  "¡Haz de este espacio tu mejor aliado! 💪",
] as const;

export const RAINBOW_HOME_GREETING =
  "Bienvenido a un espacio donde cada paso cuenta 🌈";

export const WELCOME_GREETINGS = [
  "¡Qué bueno tenerte de vuelta, {name}! 👋",
  "¡Hola de nuevo, {name}! Qué gusto verte por aquí 😊",
  "¡Bienvenido de nuevo a tu espacio, {name}! ✨",
  "¡Qué alegría verte de nuevo por aquí, {name}! 🌟",
  "¡Hola, {name}! Me alegra acompañarte otra vez 💛",
  "¡Aquí estás de nuevo, {name}! Vamos a tu ritmo 🌱",
  "¡Qué gusto tenerte por aquí otra vez, {name}! 😊",
  "¡Hola, {name}! Tu espacio te estaba esperando ⭐",
  "¡De vuelta a tu espacio, {name}! ¿Empezamos? 🚀",
  "¡Qué bueno coincidir de nuevo, {name}! 👋",
  "¡Hola, {name}! Aquí tienes tu momento para ti 🌿",
  "¡Me alegra verte por aquí otra vez, {name}! ✨",
  "¡Bienvenido otra vez, {name}! Vamos paso a paso 💪",
  "¡Hola de nuevo! Qué bueno que te regales este momento, {name} 💛",
] as const;

const LEADS = ["Ya has completado", "Ya llevas"] as const;

function dailyIndex(length: number, salt: string, dateKey: string): number {
  const seed = `${dateKey}:${salt}`;
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

export function homeGreetingForToday(
  includeRainbow: boolean,
  dateKey: string = currentDateKey(),
): string {
  const greetings = includeRainbow
    ? [...HOME_GREETINGS, RAINBOW_HOME_GREETING]
    : [...HOME_GREETINGS];
  return greetings[dailyIndex(greetings.length, "home-h1", dateKey)];
}

export function welcomeGreetingForToday(
  name: string,
  dateKey: string = currentDateKey(),
): string {
  const template = WELCOME_GREETINGS[dailyIndex(WELCOME_GREETINGS.length, "welcome", dateKey)];
  return template.split("{name}").join(name);
}

export function encouragementLeadForToday(dateKey: string = currentDateKey()): string {
  return LEADS[dailyIndex(LEADS.length, "encouragement-lead", dateKey)];
}
