"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const SEGMENT_LABELS: Record<string, string> = {
  personalizar: "Personalizar",
  historial: "Historial",
  papelera: "Papelera",
  cuenta: "Cuenta",
  sesion: "Sesión",
  "sesion/nueva": "Nueva sesión",
  recomendaciones: "No sé qué hacer",
};

function buildCrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return [];

  const crumbs: { label: string; href: string }[] = [
    { label: "Inicio", href: ROUTES.home },
  ];

  if (segments.length >= 3) {
    const midKey = segments.slice(1).join("/");
    const midLabel = SEGMENT_LABELS[midKey];
    if (midLabel) {
      crumbs.push({
        label: midLabel,
        href: `/app/${midKey}`,
      });
    }
  }

  return crumbs;
}

export function Breadcrumbs({
  pathname,
  compact = false,
}: {
  pathname: string;
  compact?: boolean;
}) {
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        compact
          ? "border-0 px-0 py-0"
          : "border-b border-border px-4 py-1.5 sm:px-6",
      )}
    >
      <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {crumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="size-3" aria-hidden="true" />}
            <Link
              href={crumb.href}
              className="transition-colors duration-200 hover:text-foreground"
            >
              {crumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
