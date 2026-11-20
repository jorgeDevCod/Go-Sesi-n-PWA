"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Gauge,
  Pencil,
  Play,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
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
  feedback,
  onFeedback,
  feedbackPending,
}: {
  recommendation: Recommendation;
  highlighted: boolean;
  isPending: boolean;
  onStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
  feedback?: 1 | -1 | null;
  onFeedback?: (value: 1 | -1 | null) => void;
  feedbackPending?: boolean;
}) {
  const rec = recommendation;
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "relative flex w-[86%] shrink-0 snap-start flex-col gap-3 overflow-hidden rounded-3xl border p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg sm:w-[47%] lg:w-[31%]",
        highlighted
          ? "border-accent-aprender/50 bg-gradient-to-b from-accent-aprender/5 via-surface to-surface shadow-md shadow-accent-aprender/10"
          : "border-border bg-surface",
      )}
    >
      <span
        className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: rec.subcategoryColor }}
        aria-hidden="true"
      />

      <div className="relative flex min-h-7 items-center justify-between gap-2">
        {highlighted ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-aprender/10 px-2.5 py-1 text-[10px] font-semibold text-accent-aprender">
            <Sparkles className="size-3" />
            Mejor opción para ti
          </span>
        ) : (
          <span />
        )}
        <div className="ml-auto flex shrink-0 items-center gap-0.5 rounded-full border border-border/70 bg-surface/85 p-0.5">
          <motion.button
            type="button"
            onClick={onEdit}
            aria-label="Editar recomendación"
            title="Editar"
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.08 }}
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
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
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="size-3.5" />
          </motion.button>
        </div>
      </div>

      <div className="relative flex items-start gap-3">
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm"
          style={{ backgroundColor: `${rec.subcategoryColor}26`, color: rec.subcategoryColor }}
        >
          <DynamicIcon name={rec.subcategoryIcon} className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
            {rec.subcategoryName}
          </p>
          <span className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: rec.subcategoryColor }}
            />
            <span className="truncate">{rec.categoryName}</span>
          </span>
        </div>
      </div>

      {rec.reason && (
        <p className="relative line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {rec.reason}
        </p>
      )}

      <div className="relative mt-auto flex flex-wrap gap-1.5">
        {rec.suggestedMinutes && (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-accent-aprender dark:bg-indigo-900/30 dark:text-indigo-400">
            <Clock className="size-3" />
            {rec.suggestedMinutes} min
          </span>
        )}
        {rec.complexity && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{
              backgroundColor: `${rec.subcategoryColor}1f`,
              color: rec.subcategoryColor,
            }}
          >
            <Gauge className="size-3" />
            {COMPLEXITY_LABELS[rec.complexity]}
          </span>
        )}
      </div>

      {onFeedback && (
        <div className="relative flex items-center justify-between gap-2 border-t border-border/70 pt-2">
          <span className="text-[11px] text-muted-foreground">¿Te sirve esta idea?</span>
          <div className="flex items-center gap-1">
            <motion.button
              type="button"
              onClick={() => onFeedback(feedback === 1 ? null : 1)}
              disabled={feedbackPending}
              aria-label="Me gusta esta recomendación"
              aria-pressed={feedback === 1}
              title="Me gusta"
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.08 }}
              className={cn(
                "flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 hover:bg-accent-aprender/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                feedback === 1 ? "bg-accent-aprender/10 text-accent-aprender" : "text-muted-foreground",
              )}
            >
              <ThumbsUp className={cn("size-4", feedback === 1 && "fill-current")} />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => onFeedback(feedback === -1 ? null : -1)}
              disabled={feedbackPending}
              aria-label="No me gusta esta recomendación"
              aria-pressed={feedback === -1}
              title="No me gusta"
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.08 }}
              className={cn(
                "flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-950",
                feedback === -1 ? "bg-red-50 text-red-500 dark:bg-red-950" : "text-muted-foreground",
              )}
            >
              <ThumbsDown className={cn("size-4", feedback === -1 && "fill-current")} />
            </motion.button>
          </div>
        </div>
      )}

      <Button size="md" className="relative w-full" onClick={onStart}>
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
