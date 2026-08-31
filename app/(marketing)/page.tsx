import Link from "next/link";
import { Layers, CalendarCheck2, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LandingActions } from "@/components/marketing/LandingActions";
import { EnterCta } from "@/components/marketing/EnterCta";
import { EnergyDemo } from "@/components/marketing/EnergyDemo";

const PILARS = [
  {
    title: "Energía en lugar de exigencia",
    description:
      "Sesiones ajustadas a tu nivel de batería. No te exigimos más de lo que puedes dar hoy.",
  },
  {
    title: "Cero Complejidad para empezar",
    description:
      "Supera el bloqueo inicial en un solo clic. Sin formularios eternos ni decisiones interminables.",
  },
  {
    title: "Tu espacio libre de culpa",
    description:
      "Para crear, estudiar, descansar o trabajar a tu ritmo. Sin contadores rojos ni presión.",
  },
];

const STEPS = [
  {
    title: "Entra a tu espacio",
    description:
      "Regístrate gratis. Al entrar eliges cómo empezar: personalizar, planificar, conocer la app o ir directo a lo tuyo.",
  },
  {
    title: "Arma tu plan del día",
    description:
      "Elige categorías y actividades por sesiones. Se muestran como desplegables en tu Home con su estado: En curso, En espera o Realizada.",
  },
  {
    title: "Inicia una sesión",
    description:
      "Elige la duración y arranca. Pausa, reanuda y extiende cuando quieras, sin fricción.",
  },
  {
    title: "Deja que Go te recomiende",
    description:
      "¿No sabes qué hacer? Go te sugiere el siguiente paso según tu energía y tiempo disponible.",
  },
  {
    title: "Personaliza a tu ritmo",
    description:
      "Ajusta los tiempos mínimos, recomendados y máximos por energía y dificultad, y personaliza las recomendaciones por categoría y actividad. Todo se adapta a ti.",
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
    question: "¿Cuánto cuesta usar Go?",
    answer: "Empezar es gratis.",
  },
];

export default function MarketingHomePage() {
  return (
    <>
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
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
          <h1 className="font-display max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Go Sesión
            <br />
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground py-2">
            Reserva una sesión para hacer lo que quieras o deja que Go te recomiende qué hacer.
          </p>

          <p className="text-sm font-medium text-foreground">Tu eliges cómo quieres empezar:</p>

          <div className="flex flex-wrap items-stretch justify-center gap-3">
            {[
              { icon: Layers, label: "Explorar categorías" },
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

          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Personaliza tus tiempos según tu energía, dificultad y disponibilidad. Go se adapta a ti.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <EnterCta className="mt-2" />
          </div>
          <LandingActions />
        </section>

        {/* Demo interactiva */}
        <section className="mx-auto w-full max-w-md px-4 py-12">
          <EnergyDemo />
        </section>

        {/* 3 Pilares */}
        <section className="mx-auto w-full max-w-4xl px-4 py-12">
          <h2 className="font-display mb-6 text-center text-2xl font-semibold text-foreground">
            Tres pilares. Cero fricción.
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {PILARS.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-3xl border border-border bg-surface p-6"
              >
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="text-sm text-muted-foreground">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo usar */}
        <section className="mx-auto w-full max-w-3xl px-4 py-12">
          <h2 className="font-display mb-2 text-center text-2xl font-semibold text-foreground">
            Cómo funciona Go
          </h2>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            Paso a paso para empezar a fluir en minutos.
          </p>
          <ol className="flex flex-col gap-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex items-start gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-aprender/10 text-sm font-bold text-accent-aprender">
                  {index + 1}
                </span>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <h3 className="mb-1 font-medium text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
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
          <h2 className="font-display mb-6 text-center text-2xl font-semibold text-foreground">
            Preguntas frecuentes
          </h2>
          <div className="flex flex-col gap-4">
            {FAQS.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-border p-5">
                <h3 className="mb-1 font-medium text-foreground">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Go — Tu siguiente paso, sin fricción.
        </footer>
      </main>
    </>
  );
}
