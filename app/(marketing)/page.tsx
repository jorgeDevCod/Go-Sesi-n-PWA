import Link from "next/link";
import {
  Layers,
  CalendarCheck2,
  Sparkles,
  Clock,
  History,
  Timer,
  TrendingUp,
  SlidersHorizontal,
  Gauge,
  BatteryMedium,
  Star,
  Palette,
  Download,
  Trash2,
  ListChecks,
  CalendarRange,
  CheckCircle2,
  Target,
  ShieldCheck,
  Rocket,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LandingActions } from "@/components/marketing/LandingActions";
import { EnterCta } from "@/components/marketing/EnterCta";
import { EnergyDemo } from "@/components/marketing/EnergyDemo";
import { AppShowcaseBanner } from "@/components/marketing/AppShowcaseBanner";
import { AppHeroMockup } from "@/components/marketing/AppHeroMockup";

const CUSTOMIZE = [
  {
    icon: BatteryMedium,
    title: "Una experiencia basada en tu energia.",
    description:
      "Cuéntanos cómo te sientes (baja, media, alta) y Go ajusta las actividades y tiempos sugeridos a tu batería de hoy.",
  },
  {
    icon: Gauge,
    title: "Dificultad que encaja",
    description:
      "Cada actividad tiene su nivel (Ligera, Moderada, Intensa) y tú decides cuál se siente bien según tu energía.",
  },
  {
    icon: Clock,
    title: "Tiempos mínimo, recomendado y máximo",
    description:
      "Define cuánto dedicar a cada actividad por energía y dificultad. El recomendado es el que verás por defecto.",
  },
  {
    icon: SlidersHorizontal,
    title: "Recomendaciones por categoría",
    description:
      "Marca qué actividades quieres que Go sugiera para cada combinación de energía y dificultad. Todo se adapta a ti.",
  },
  {
    icon: Star,
    title: "Accesos rápidos en tu Home",
    description:
      "Agrega tus actividades favoritas al inicio para empezarlas de un toque, sin buscar entre todo.",
  },
  {
    icon: Palette,
    title: "Tu tema de color",
    description:
      "Elige entre varios temas (celeste, verde, rosa, humo, blanco y oscuro) para que la app se sienta como tú.",
  },
  {
    icon: Download,
    title: "Instálala como app",
    description:
      "Descarga Go en tu pantalla de inicio y úsala como una app más, incluso sin conexión.",
  },
  {
    icon: Trash2,
    title: "Papelera con recuperación",
    description:
      "Nada se pierde para siempre: lo que elimines va a la papelera (máx. 50 artículos, 15 días) y puedes restaurarlo cuando quieras.",
  },
];

const TRACKING = [
  {
    icon: Clock,
    title: "Cada minuto queda registrado",
    description:
      "Go mide el tiempo real de cada sesión —con pausas y extensiones— para que sepas cuánto dedicaste de verdad, no lo que planeaste.",
  },
  {
    icon: History,
    title: "Un historial que te cuenta tu constancia",
    description:
      "Revisa cada sesión por día: completa o interrumpida, con su duración, si la extendiste y cuánto sobró. Tu esfuerzo deja huella.",
  },
  {
    icon: Timer,
    title: "Extiende cuando quieras",
    description:
      "Si el ritmo fluye, suma minutos y mira reflejado en el historial exactamente cuánto extra le dedicaste a esa actividad.",
  },
  {
    icon: TrendingUp,
    title: "Tu avance, visible de un vistazo",
    description:
      "El Home te muestra tus sesiones completadas, minutos acumulados y actividades realizada contra tu plan del día. Progreso sin culpa.",
  },
];

const PLANNING = [
  {
    icon: ListChecks,
    title: "Arma tu plan del día en minutos",
    description:
      "Elige las categorías y actividades que harás hoy. Go las organiza por sesiones y te muestra su estado: En curso, En espera o Realizada.",
  },
  {
    icon: CalendarRange,
    title: "Tu día, con un solo vistazo",
    description:
      "El Home agrupa tu plan en desplegables por categoría. Ves lo que falta, lo que ya hiciste y sigues adelante sin perder el hilo.",
  },
  {
    icon: CheckCircle2,
    title: "Cada actividad, en su momento",
    description:
      "Planificas por sesión: qué hacer, cuánto dedicarle y en qué orden. Deja atrás la indecisión y empieza a fluir.",
  },
  {
    icon: Clock,
    title: "Lo que planeas, se cumple",
    description:
      "Al iniciar cada actividad, Go cronometra el tiempo real y te avisa al terminar. Tu plan deja de ser una lista y se vuelve acción.",
  },
];

const BENEFITS = [
  {
    icon: Rocket,
    title: "Empieza sin decidir todo",
    description: "Elige una sola actividad y arranca. Nada de sobrepensar ni quedarte trabado.",
  },
  {
    icon: ShieldCheck,
    title: "Sin culpa ni presión",
    description: "Avanza a tu ritmo. Si un día hay poca energía, Go te sugiere algo ligero.",
  },
  {
    icon: Target,
    title: "Constancia que se nota",
    description: "Cada sesión queda registrada. Ver tu historial te motiva a seguir, un paso a la vez.",
  },
  {
    icon: Sparkles,
    title: "Sugerencias a tu medida",
    description: "Cuando no sepas qué hacer, Go te recomienda según tu energía y tiempo disponible.",
  },
];

const STEPS = [
  {
    title: "Regístrate e inicia sesión",
    description:
      "Crea tu cuenta gratis en menos de un minuto: solo un nombre, tu correo y una contraseña. Al entrar ya estás listo para reservar tu primera sesión y hacer que cada momento cuente.",
  },
  {
    title: "Entra a tu espacio",
    description:
      "Una vez dentro, elige cómo empezar: personalizar, planificar, conocer la app o ir directo a lo tuyo.",
  },
  {
    title: "Arma tu plan del día",
    description:
      "Elige categorías y actividades por sesiones. Se ven en tu Home con su estado: En curso, En espera o Realizada.",
  },
  {
    title: "Inicia una sesión",
    description:
      "Define la duración y arranca. Pausa, reanuda y extiende cuando quieras. Go registra el tiempo real.",
  },
  {
    title: "Deja que Go te recomiende",
    description:
      "¿No sabes qué hacer? Go te sugiere el siguiente paso según tu energía y tiempo disponible.",
  },
  {
    title: "Personaliza lo que quieras",
    description:
      "Ajusta energía, dificultad, tiempos y recomendaciones por categoría. Todo se adapta a ti.",
  },
  {
    title: "Revisa tu historial",
    description:
      "Cada sesión queda registrada: duración, si la completaste o interrumpiste y cuánto extendiste.",
  },
  {
    title: "Llévala contigo",
    description:
      "Instala Go como app, elige tu tema de color y accede desde cualquier dispositivo.",
  },
];

const FAQS = [
  {
    question: "¿Go es un gestor de tareas?",
    answer:
      "No. Go no guarda listas interminables ni fechas límite: solo te ayuda a elegir un siguiente paso y a empezarlo, sin culpa.",
  },
  {
    question: "¿Qué pasa si tengo poca energía o ansiedad?",
    answer:
      "Go te sugiere solo sesiones cortas y actividades ligeras cuando así lo indicas. Nunca te presiona a hacer más.",
  },
  {
    question: "¿Qué mide Go de mis sesiones?",
    answer:
      "Registra la duración real de cada sesión (con pausas y extensiones), si la completaste o interrumpiste, cuánto tiempo le extendiste y cuánto sobró. Además suma tus sesiones completadas y minutos acumulados.",
  },
  {
    question: "¿Puedo personalizar todo o Go decide por mí?",
    answer:
      "Tú mandas. Puedes ajustar energía, dificultad y tiempos por actividad, y decirle a Go exactamente qué recomendarte. O, si prefieres, dejar que Go elija por ti según tu ánimo. Tú decides.",
  },
  {
    question: "¿Puedo recuperar algo que eliminé?",
    answer:
      "Sí. Las actividades y categorías eliminadas van a la papelera en lugar de borrarse para siempre. Guarda hasta 50 artículos durante 15 días y puedes restaurarlos cuando quieras. Si cambias de opinión en el momento, tienes 5 segundos para deshacer.",
  },
  {
    question: "¿Cuánto cuesta usar Go?",
    answer: "Empezar es gratis.",
  },
];

export default function MarketingHomePage() {
  return (
    <div className="font-sans">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 py-3 shadow-sm sm:px-6">
        <Link href="/" aria-label="Go — Ir al inicio" title="Go">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="flex flex-col">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center">
          <h1 className="font-display max-w-2xl text-4xl font-bold leading-tight tracking-[0.02em] text-foreground sm:text-5xl md:text-6xl">
            Go Sesión
          </h1>

          <p className="max-w-xl text-lg font-normal leading-[1.6] text-muted-foreground py-2">
            Una plataforma creada para pasar de la intención a la acción, reducir la procrastinación y avanzar a tu ritmo, en un espacio pensado para ti.{" "}
            <a
              className="font-semibold text-accent-aprender transition-colors duration-200 hover:text-accent-aprender-hover"
              href="/register"
              target="_blank"
              rel="noopener noreferrer"
            >
              ¡Ingresa Ya!
            </a>
          </p>

          <div className="w-full">
            <AppHeroMockup />
          </div>

          <div className="w-full">
            <AppShowcaseBanner />
          </div>

          <h2 className="font-display text-center text-2xl font-bold leading-tight tracking-[0.02em] text-foreground">Tú eliges cómo quieres empezar</h2>

          <div className="flex flex-wrap items-stretch justify-center gap-3">
            {[
              { icon: Layers, label: "Explorar o crear categorias" },
              { icon: CalendarCheck2, label: "Planificar actividades" },
              { icon: Sparkles, label: "Recibir una recomendación" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 hover:bg-surface-hover"
              >
                <Icon className="size-4 shrink-0 text-accent-aprender" />
                {label}
              </div>
            ))}
          </div>

          <p className="max-w-md text-sm font-normal leading-[1.6] text-muted-foreground">
            Personaliza tu experiencia y recomendaciones: por energía, dificultad y disponibilidad. Go se adapta a ti.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <EnterCta className="mt-2" />
          </div>
          <LandingActions />
        </section>

        {/* Beneficios */}
        <section className="mx-auto w-full max-w-4xl px-4 py-12">
          <h2 className="font-display mb-2 text-center text-3xl font-bold leading-tight tracking-[0.02em] text-foreground">
            Lo que Go Sesión hace por ti
          </h2>
          <p className="mb-8 text-center text-sm font-normal leading-[1.6] text-muted-foreground">
            Una herramienta para avanzar sin fricción, adaptarse a tu energía y dejar de sobrepensar.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-start gap-3 rounded-3xl border border-border bg-surface p-6 text-left transition-all duration-200 hover:border-border-hover hover:shadow-md"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-aprender/10 text-accent-aprender">
                  <item.icon className="size-5" />
                </span>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm font-normal leading-[1.6] text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Demo interactiva */}
        <section className="mx-auto w-full max-w-md px-4 py-4">
          <EnergyDemo />
        </section>

        {/* Personalización */}
        <section className="mx-auto w-full max-w-4xl px-4 py-12">
          <h2 className="font-display mb-2 text-center text-3xl font-bold leading-tight tracking-[0.02em] text-foreground">
            Todo se adapta a ti
          </h2>
          <p className="mb-8 text-center text-sm font-normal leading-[1.6] text-muted-foreground">
            Ajusta energía, dificultad, tiempos y recomendaciones. Go se moldea a cómo te sientes cada día.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CUSTOMIZE.map((item) => (
              <div
                key={item.title}
                className="group rounded-3xl border border-border bg-surface p-6 transition-all duration-200 hover:border-border-hover hover:shadow-md"
              >
                <span className="mb-4 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-aprender/10 text-accent-aprender transition-colors duration-200 group-hover:bg-accent-aprender group-hover:text-white">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mb-1.5 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm font-normal leading-[1.6] text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Planificación */}
        <section className="mx-auto w-full max-w-4xl px-4 py-12">
          <h2 className="font-display mb-2 text-center text-3xl font-bold leading-tight tracking-[0.02em] text-foreground">
            Planifica tu día y hazlo realidad
          </h2>
          <p className="mb-8 text-center text-sm font-normal leading-[1.6] text-muted-foreground">
            Organiza lo que harás hoy por sesiones, con su duración y su estado. Menos decisiones, más acción.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {PLANNING.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-3xl border border-border bg-surface p-6 transition-all duration-200 hover:border-border-hover hover:shadow-md"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-aprender/10 text-accent-aprender">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <h3 className="mb-1 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm font-normal leading-[1.6] text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Medición e historial */}
        <section className="mx-auto w-full max-w-4xl px-4 py-12">
          <h2 className="font-display mb-2 text-center text-3xl font-bold leading-tight tracking-[0.02em] text-foreground">
            Mide tu avance, celebra cada paso
          </h2>
          <p className="mb-8 text-center text-sm font-normal leading-[1.6] text-muted-foreground">
            Go no solo te ayuda a empezar: también registra tu constancia para que veas cuánto has avanzado, sin presión.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {TRACKING.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-3xl border border-border bg-surface p-6"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-aprender/10 text-accent-aprender">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <h3 className="mb-1 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm font-normal leading-[1.6] text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo usar */}
        <section className="mx-auto w-full max-w-3xl px-4 py-12">
          <h2 className="font-display mb-2 text-center text-3xl font-bold leading-tight tracking-[0.02em] text-foreground">
            Cómo funciona Go
          </h2>
          <p className="mb-8 text-center text-sm font-normal leading-[1.6] text-muted-foreground">
            Conoce cómo funciona y mejora tu experiencia. ⭐
          </p>
          <ol className="flex flex-col gap-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex items-start gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-aprender/10 text-sm font-bold text-accent-aprender">
                  {index + 1}
                </span>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <h3 className="mb-1 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm font-normal leading-[1.6] text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <EnterCta className="mt-2" />
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-2xl px-4 py-12">
          <h2 className="font-display mb-6 text-center text-3xl font-bold leading-tight tracking-[0.02em] text-foreground">
            Preguntas frecuentes
          </h2>
          <div className="flex flex-col gap-4">
            {FAQS.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:border-border-hover hover:shadow-md"
              >
                <h3 className="mb-1 text-base font-semibold text-foreground">{faq.question}</h3>
                <p className="text-sm font-normal leading-[1.6] text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Go Sesión - Tu Aliado para empezar @2026.
        </footer>
      </main>
    </div>
  );
}
