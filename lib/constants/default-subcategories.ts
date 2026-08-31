export type Complexity = "LOW" | "MEDIUM" | "HIGH";

export type DefaultSubcategorySeed = {
  name: string;
  icon: string;
  color: string;
  order: number;
  complexity: Complexity;
};

// Seeded into every user's default categories (on registration and as a
// one-time backfill for accounts created before these banks existed). The
// recommendation algorithm uses `complexity` to match activities with the
// user's energy level and available time.
export const DEFAULT_SUBCATEGORIES_BY_KEY: Record<string, DefaultSubcategorySeed[]> = {
  aprender: [
    { name: "Programación", icon: "Code", color: "#6366F1", order: 0, complexity: "HIGH" },
    { name: "Inglés", icon: "Languages", color: "#0EA5E9", order: 1, complexity: "MEDIUM" },
    { name: "Arquitectura", icon: "Building2", color: "#8B5CF6", order: 2, complexity: "HIGH" },
    { name: "Spring", icon: "Leaf", color: "#22C55E", order: 3, complexity: "HIGH" },
    { name: "Docker", icon: "Container", color: "#0284C7", order: 4, complexity: "MEDIUM" },
    { name: "React", icon: "Atom", color: "#06B6D4", order: 5, complexity: "MEDIUM" },
    { name: "AWS", icon: "Cloud", color: "#F59E0B", order: 6, complexity: "HIGH" },
    { name: "SQL", icon: "Database", color: "#14B8A6", order: 7, complexity: "MEDIUM" },
    { name: "Git", icon: "GitBranch", color: "#F97316", order: 8, complexity: "LOW" },
    { name: "Linux", icon: "Terminal", color: "#64748B", order: 9, complexity: "MEDIUM" },
    { name: "Testing", icon: "FlaskConical", color: "#10B981", order: 10, complexity: "MEDIUM" },
    { name: "System Design", icon: "Network", color: "#7C3AED", order: 11, complexity: "HIGH" },
    { name: "IA", icon: "Brain", color: "#EC4899", order: 12, complexity: "HIGH" },
    { name: "Leer un libro", icon: "BookOpen", color: "#0EA5E9", order: 13, complexity: "LOW" },
    {
      name: "Ver un documental",
      icon: "Tv",
      color: "#64748B",
      order: 14,
      complexity: "LOW",
    },
  ],
  salud: [
    { name: "Meditación", icon: "Sparkles", color: "#14B8A6", order: 0, complexity: "LOW" },
    { name: "Estiramientos", icon: "Activity", color: "#22C55E", order: 1, complexity: "LOW" },
    { name: "Yoga", icon: "Flower2", color: "#8B5CF6", order: 2, complexity: "MEDIUM" },
    { name: "Caminata", icon: "Footprints", color: "#10B981", order: 3, complexity: "LOW" },
    { name: "Correr", icon: "Bike", color: "#EF4444", order: 4, complexity: "MEDIUM" },
    { name: "Natación", icon: "Droplet", color: "#0EA5E9", order: 5, complexity: "MEDIUM" },
    {
      name: "Respiración consciente",
      icon: "Wind",
      color: "#14B8A6",
      order: 6,
      complexity: "LOW",
    },
    {
      name: "Preparar comida saludable",
      icon: "Salad",
      color: "#22C55E",
      order: 7,
      complexity: "MEDIUM",
    },
    { name: "Sueño reparador", icon: "Moon", color: "#6366F1", order: 8, complexity: "LOW" },
    {
      name: "Hidratación y descanso",
      icon: "Droplet",
      color: "#0EA5E9",
      order: 9,
      complexity: "LOW",
    },
    { name: "Caminata matutina", icon: "Sunrise", color: "#F59E0B", order: 10, complexity: "LOW" },
    {
      name: "Automasaje y relajación",
      icon: "Sparkles",
      color: "#EC4899",
      order: 11,
      complexity: "LOW",
    },
    { name: "Chequeo de salud", icon: "Stethoscope", color: "#0EA5E9", order: 12, complexity: "LOW" },
    { name: "Ciclismo", icon: "Bike", color: "#22C55E", order: 13, complexity: "MEDIUM" },
  ],
  entrenamiento: [
    { name: "Rutina de cuerpo completo", icon: "Dumbbell", color: "#EF4444", order: 0, complexity: "HIGH" },
    { name: "Entrenamiento de fuerza", icon: "Weight", color: "#F97316", order: 1, complexity: "HIGH" },
    { name: "Cardio", icon: "HeartPulse", color: "#22C55E", order: 2, complexity: "HIGH" },
    { name: "HIIT", icon: "Zap", color: "#6366F1", order: 3, complexity: "HIGH" },
    { name: "Calistenia", icon: "PersonStanding", color: "#14B8A6", order: 4, complexity: "MEDIUM" },
    { name: "Flexibilidad", icon: "Activity", color: "#8B5CF6", order: 5, complexity: "MEDIUM" },
    { name: "Rutina de piernas", icon: "Bike", color: "#0EA5E9", order: 6, complexity: "HIGH" },
    { name: "Rutina de espalda", icon: "PersonStanding", color: "#F59E0B", order: 7, complexity: "HIGH" },
    { name: "Series de flexiones", icon: "Dumbbell", color: "#EC4899", order: 8, complexity: "LOW" },
    { name: "Abdominales", icon: "Activity", color: "#22C55E", order: 9, complexity: "MEDIUM" },
    { name: "Caminata rápida", icon: "Footprints", color: "#22C55E", order: 10, complexity: "LOW" },
    { name: "Carrera ligera", icon: "Timer", color: "#EF4444", order: 11, complexity: "MEDIUM" },
    {
      name: "Estiramientos dinámicos",
      icon: "Flower2",
      color: "#8B5CF6",
      order: 12,
      complexity: "LOW",
    },
    { name: "Circuito de fuerza", icon: "Dumbbell", color: "#F97316", order: 13, complexity: "HIGH" },
  ],
  diversion: [
    { name: "Jugar videojuegos", icon: "Gamepad2", color: "#EC4899", order: 0, complexity: "LOW" },
    { name: "Ver una película", icon: "Clapperboard", color: "#8B5CF6", order: 1, complexity: "LOW" },
    { name: "Leer por placer", icon: "BookOpen", color: "#6366F1", order: 2, complexity: "LOW" },
    { name: "Escuchar música", icon: "Music", color: "#14B8A6", order: 3, complexity: "LOW" },
    { name: "Dibujar o pintar", icon: "Palette", color: "#F97316", order: 4, complexity: "MEDIUM" },
    { name: "Cocinar algo nuevo", icon: "CookingPot", color: "#F59E0B", order: 5, complexity: "MEDIUM" },
    { name: "Fotografía", icon: "Camera", color: "#0EA5E9", order: 6, complexity: "MEDIUM" },
    { name: "Resolver puzzles", icon: "Puzzle", color: "#22C55E", order: 7, complexity: "LOW" },
    { name: "Aprender un hobby", icon: "Heart", color: "#EC4899", order: 8, complexity: "MEDIUM" },
    { name: "Ver un partido", icon: "Trophy", color: "#EF4444", order: 9, complexity: "LOW" },
    { name: "Karaoke", icon: "Mic", color: "#EC4899", order: 10, complexity: "LOW" },
    { name: "Armar un rompecabezas", icon: "Puzzle", color: "#8B5CF6", order: 11, complexity: "LOW" },
    { name: "Salir a pasear", icon: "Map", color: "#22C55E", order: 12, complexity: "LOW" },
    {
      name: "Explorar un lugar nuevo",
      icon: "Compass",
      color: "#14B8A6",
      order: 13,
      complexity: "MEDIUM",
    },
  ],
  finanzas: [
    { name: "Revisar presupuesto", icon: "Wallet", color: "#F59E0B", order: 0, complexity: "MEDIUM" },
    { name: "Actualizar gastos", icon: "Receipt", color: "#14B8A6", order: 1, complexity: "LOW" },
    { name: "Planificación financiera", icon: "TrendingUp", color: "#0EA5E9", order: 2, complexity: "MEDIUM" },
    { name: "Investigar inversiones", icon: "ChartLine", color: "#22C55E", order: 3, complexity: "HIGH" },
    { name: "Pagar facturas", icon: "CreditCard", color: "#64748B", order: 4, complexity: "LOW" },
    { name: "Revisar suscripciones", icon: "Banknote", color: "#8B5CF6", order: 5, complexity: "LOW" },
    { name: "Ahorro automático", icon: "PiggyBank", color: "#F97316", order: 6, complexity: "MEDIUM" },
    { name: "Educación financiera", icon: "BookOpen", color: "#6366F1", order: 7, complexity: "MEDIUM" },
    { name: "Declaración de impuestos", icon: "FileText", color: "#EF4444", order: 8, complexity: "HIGH" },
    { name: "Podcast financiero", icon: "Headphones", color: "#8B5CF6", order: 9, complexity: "LOW" },
    { name: "Revisar metas financieras", icon: "Target", color: "#22C55E", order: 10, complexity: "LOW" },
    {
      name: "Crear fondo de emergencia",
      icon: "PiggyBank",
      color: "#14B8A6",
      order: 11,
      complexity: "MEDIUM",
    },
    { name: "Comparar seguros", icon: "ShieldCheck", color: "#0EA5E9", order: 12, complexity: "MEDIUM" },
  ],
  "descanso-consciente": [
    { name: "Meditación", icon: "Sparkles", color: "#14B8A6", order: 0, complexity: "LOW" },
    { name: "Siesta reparadora", icon: "Moon", color: "#6366F1", order: 1, complexity: "LOW" },
    { name: "Lectura ligera", icon: "BookOpen", color: "#0EA5E9", order: 2, complexity: "LOW" },
    { name: "Baño relajante", icon: "Bath", color: "#22C55E", order: 3, complexity: "LOW" },
    { name: "Música relajante", icon: "Headphones", color: "#EC4899", order: 4, complexity: "LOW" },
    { name: "Respiración 4-7-8", icon: "Wind", color: "#14B8A6", order: 5, complexity: "LOW" },
    { name: "Paseo al aire libre", icon: "TreePine", color: "#22C55E", order: 6, complexity: "LOW" },
    { name: "Journaling", icon: "PenTool", color: "#F59E0B", order: 7, complexity: "LOW" },
    { name: "Desconexión de pantallas", icon: "Smartphone", color: "#8B5CF6", order: 8, complexity: "LOW" },
    { name: "Estiramientos suaves", icon: "Flower2", color: "#F97316", order: 9, complexity: "LOW" },
  ],
  trabajo: [
    { name: "Bloque de foco profundo", icon: "Target", color: "#8B5CF6", order: 0, complexity: "HIGH" },
    { name: "Planificar la semana", icon: "Calendar", color: "#6366F1", order: 1, complexity: "MEDIUM" },
    { name: "Revisar correos", icon: "Mail", color: "#0EA5E9", order: 2, complexity: "LOW" },
    { name: "Análisis de datos", icon: "ChartLine", color: "#22C55E", order: 3, complexity: "HIGH" },
    { name: "Documentación", icon: "FileText", color: "#64748B", order: 4, complexity: "LOW" },
    { name: "Seguimiento de tareas", icon: "ClipboardList", color: "#F59E0B", order: 5, complexity: "MEDIUM" },
    { name: "Preparar presentación", icon: "Presentation", color: "#EC4899", order: 6, complexity: "MEDIUM" },
    { name: "Investigación", icon: "Search", color: "#14B8A6", order: 7, complexity: "HIGH" },
    { name: "Reunión de equipo", icon: "Users", color: "#0EA5E9", order: 8, complexity: "MEDIUM" },
  ],
};

export const DEFAULT_APRENDER_SUBCATEGORIES: DefaultSubcategorySeed[] =
  DEFAULT_SUBCATEGORIES_BY_KEY["aprender"];
