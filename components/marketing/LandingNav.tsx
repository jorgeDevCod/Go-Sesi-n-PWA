"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const LANDING_TABS = [
  { id: "inicio", label: "Inicio" },
  { id: "empezar", label: "Empezar" },
  { id: "beneficios", label: "Beneficios" },
  { id: "personalizar", label: "Personalizar" },
  { id: "planificar", label: "Planificar" },
  { id: "avance", label: "Avance" },
  { id: "como-funciona", label: "Ayuda" },
  { id: "faq", label: "Preguntas" },
] as const;

const SECTION_TO_TAB: Record<string, string> = {
  inicio: "inicio",
  empezar: "empezar",
  beneficios: "beneficios",
  personalizar: "personalizar",
  planificar: "planificar",
  avance: "avance",
  "como-funciona": "como-funciona",
  faq: "faq",
};

const OBSERVED_SECTIONS = ["inicio", "empezar", "beneficios", "personalizar", "planificar", "avance", "como-funciona", "faq"];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}

/**
 * Tabs de ancla de la landing (desktop centrado + pills con scroll en móvil).
 * Solo marketing: no toca `/app/*`.
 */
export function LandingNav({ variant }: { variant: "desktop" | "mobile" }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const sections = OBSERVED_SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(SECTION_TO_TAB[entry.target.id] ?? null);
          }
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  if (variant === "mobile") {
    return (
      <nav
        aria-label="Secciones"
        className="flex gap-2 overflow-x-auto pb-1 md:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {LANDING_TABS.map((tab) => (
          <a
            key={tab.id}
            href={`#${tab.id}`}
            onClick={(event) => {
              event.preventDefault();
              scrollToSection(tab.id);
            }}
            aria-current={active === tab.id ? "true" : undefined}
            className={cn(
              "shrink-0 cursor-pointer snap-start rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
              active === tab.id
                ? "border-accent-aprender bg-accent-aprender/10 text-accent-aprender"
                : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </a>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Secciones" className="hidden items-center gap-1 md:flex">
      {LANDING_TABS.map((tab) => (
        <a
          key={tab.id}
          href={`#${tab.id}`}
          onClick={(event) => {
            event.preventDefault();
            scrollToSection(tab.id);
          }}
          aria-current={active === tab.id ? "true" : undefined}
          className={cn(
            "cursor-pointer rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
            active === tab.id
              ? "text-accent-aprender"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </a>
      ))}
    </nav>
  );
}
