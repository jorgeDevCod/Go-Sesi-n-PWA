"use client";

import { useRouter } from "next/navigation";
import { Play, House } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";
import { COMPLEXITY_LABELS } from "@/services/recommendation/energy-level";
import { useHomeQuickStore, type HomeQuickItem } from "@/features/home/store/home-quick.store";

const COMPLEXITY_BADGE: Record<HomeQuickItem["complexity"], string> = {
  LOW: "bg-surface-muted text-muted-foreground",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  HIGH: "bg-indigo-100 text-accent-aprender dark:bg-indigo-950 dark:text-indigo-400",
};

export function HomeQuickSection() {
  const router = useRouter();
  const items = useHomeQuickStore((s) => s.items);
  const remove = useHomeQuickStore((s) => s.remove);

  if (items.length === 0) return null;

  function start(item: HomeQuickItem) {
    router.push(`/app/session/new?category=${item.categoryId}&activity=${item.subcategoryId}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-accent-aprender/10">
          <House className="size-4 text-accent-aprender" />
        </span>
        <div>
          <p className="font-display text-base font-semibold text-foreground">Accesos rápidos</p>
          <p className="text-xs text-muted-foreground">
            Tus actividades marcadas para empezar de un toque.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.subcategoryId}
            className="group relative flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm transition-all duration-200 hover:border-border-hover hover:shadow-md"
          >
            <button
              type="button"
              onClick={() => start(item)}
              title={`Empezar ${item.subcategoryName}`}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${item.subcategoryColor}33`, color: item.subcategoryColor }}
              >
                <DynamicIcon name={item.subcategoryIcon} className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {item.subcategoryName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {item.categoryName}
                </span>
              </span>
            </button>

            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                COMPLEXITY_BADGE[item.complexity],
              )}
            >
              {COMPLEXITY_LABELS[item.complexity]}
            </span>

            <button
              type="button"
              onClick={() => start(item)}
              aria-label={`Iniciar ${item.subcategoryName}`}
              title="Iniciar"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent-aprender/10 text-accent-aprender transition-colors hover:bg-accent-aprender hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              <Play className="size-4 fill-current" />
            </button>

            <button
              type="button"
              onClick={() => remove(item.subcategoryId)}
              aria-label={`Quitar ${item.subcategoryName} del inicio`}
              title="Quitar del inicio"
              className="absolute -top-1.5 -right-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-muted-foreground opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 hover:border-red-200 hover:bg-red-50 hover:text-red-500 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:border-red-900 dark:hover:bg-red-950"
            >
              <House className="size-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
