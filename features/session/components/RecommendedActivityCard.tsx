"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Pencil, Play, Trash2 } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Button } from "@/components/ui/Button";
import { COMPLEXITY_LABELS } from "@/services/recommendation/energy-level";
import type { Recommendation } from "@/services/recommendation/recommendation.types";
import { cn } from "@/lib/utils";

export function RecommendedActivityCard({
  recommendation,
  highlighted,
  isPending,
  onStart,
  onEdit,
  onDelete,
}: {
  recommendation: Recommendation;
  highlighted: boolean;
  isPending: boolean;
  onStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const rec = recommendation;
  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.12 }}
      className={cn(
        "relative flex w-[82%] shrink-0 snap-start flex-col gap-3 overflow-hidden rounded-2xl border bg-surface p-5 shadow-sm sm:w-[47%] lg:w-[31%]",
        highlighted ? "border-accent-aprender/60" : "border-border",
      )}
    >
      {highlighted && (
        <span className="relative z-10 inline-flex items-center gap-1 self-start rounded-full bg-accent-aprender/10 px-2 py-0.5 text-[10px] font-semibold text-accent-aprender">
          <CheckCircle2 className="size-3" />
          Recomendada
        </span>
      )}

      <div className="relative flex items-start gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-xl shadow-sm"
          style={{ backgroundColor: `${rec.subcategoryColor}26`, color: rec.subcategoryColor }}
        >
          <DynamicIcon name={rec.subcategoryIcon} className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-semibold text-foreground">{rec.subcategoryName}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{rec.categoryName}</p>
        </div>
        <div className="flex shrink-0 gap-0.5">
          <motion.button
            type="button"
            onClick={onEdit}
            aria-label="Editar recomendación"
            title="Editar"
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.08 }}
            className="shrink-0 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <Pencil className="size-3.5" />
          </motion.button>
          <motion.button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            aria-label="Eliminar recomendación"
            title="Eliminar"
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.08 }}
            className="shrink-0 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors duration-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="size-3.5" />
          </motion.button>
        </div>
      </div>

      {highlighted && rec.reason && (
        <p className="relative line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {rec.reason}
        </p>
      )}

      <div className="relative flex flex-wrap gap-1.5">
        {rec.suggestedMinutes && (
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-accent-aprender dark:bg-indigo-900/30 dark:text-indigo-400">
            {rec.suggestedMinutes} min
          </span>
        )}
        {rec.complexity && (
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: `${rec.subcategoryColor}26`, color: rec.subcategoryColor }}
          >
            {COMPLEXITY_LABELS[rec.complexity]}
          </span>
        )}
      </div>

      <Button
        size="md"
        className="relative w-full"
        onClick={onStart}
      >
        {highlighted ? (
          <>
            <CheckCircle2 className="size-4" />
            Empezar esta
          </>
        ) : (
          <>
            <Play className="size-4" />
            Empezar
          </>
        )}
      </Button>
    </motion.article>
  );
}
