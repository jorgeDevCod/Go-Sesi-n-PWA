import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
