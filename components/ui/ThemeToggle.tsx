"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type ThemeOption = {
  key: string;
  label: string;
  swatch: string;
};

const THEMES: ThemeOption[] = [
  { key: "dark", label: "Oscuro", swatch: "#26262B" },
  { key: "blanco", label: "Blanco", swatch: "#FFFFFF" },
  { key: "humo", label: "Blanco humo", swatch: "#E9E9E6" },
  { key: "rosa", label: "Rosa", swatch: "#F2A9C4" },
  { key: "celeste", label: "Celeste", swatch: "#8A97E0" },
  { key: "verde", label: "Verde", swatch: "#6FBF8A" },
];

function subscribeNoop() {
  return () => {};
}

// Hydration-safe "are we on the client yet" check without setState-in-effect:
// the client snapshot differs from the server snapshot on purpose, which
// forces exactly one extra client render right after hydration.
function useMounted() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!mounted) {
    return <div className={cn("size-10", className)} aria-hidden="true" />;
  }

  const active = THEMES.find((option) => option.key === theme)?.key ?? resolvedTheme;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Cambiar tema"
        title="Cambiar tema"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-border text-foreground transition-colors duration-300 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
      >
        <span
          className="grid size-6 shrink-0 grid-cols-2 overflow-hidden rounded-full border border-border/60 shadow-sm"
          aria-hidden="true"
        >
          <span style={{ backgroundColor: "#29292E" }} />
          <span style={{ backgroundColor: "#FAFAFA" }} />
          <span style={{ backgroundColor: "#8995D8" }} />
          <span style={{ backgroundColor: "#F2A9C4" }} />
          <span style={{ backgroundColor: "#F2F2F2" }} />
          <span style={{ backgroundColor: "#78B98E" }} />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Temas"
          className="absolute top-12 right-0 z-[200] flex min-w-44 flex-col gap-1 rounded-2xl border border-border bg-surface p-1.5 shadow-xl"
        >
          {THEMES.map((option) => {
            const isActive = active === option.key;
            return (
              <button
                key={option.key}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  setTheme(option.key);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                  isActive ? "bg-surface-muted" : "hover:bg-surface-hover",
                )}
              >
                <span
                  className="size-4 shrink-0 rounded-full border border-border/70"
                  style={{ backgroundColor: option.swatch }}
                  aria-hidden="true"
                />
                {option.label}
                {isActive && <Check className="ml-auto size-4 shrink-0 text-accent-aprender" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
