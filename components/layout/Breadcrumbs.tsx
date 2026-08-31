"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const SEGMENT_LABELS: Record<string, string> = {
  history: "Historial",
  subcategories: "Actividades",
  session: "Sesión",
  "session/new": "Nueva sesión",
  "session/recommend": "No sé qué hacer",
};

function buildCrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return [];

  const crumbs: { label: string; href: string }[] = [{ label: "Inicio", href: "/app/home" }];

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

export function Breadcrumbs({ pathname }: { pathname: string }) {
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="border-b border-border px-4 py-1.5 sm:px-6">
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
