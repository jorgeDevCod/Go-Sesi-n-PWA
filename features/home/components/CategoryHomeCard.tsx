"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { Complexity } from "@/lib/constants/default-subcategories";

export type CategoryHomeData = {
  id: string;
  key: string | null;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  complexity: Complexity;
  subcategoryCount: number;
};

export function CategoryHomeCard({ category }: { category: CategoryHomeData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleNavigate() {
    startTransition(() => {
      router.push(`/app/session/new?category=${category.id}`);
    });
  }

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.08 }}
      className="h-full"
    >
      <button
        type="button"
        onClick={handleNavigate}
        disabled={isPending}
        title={`${category.name}-Ir a esta categoría`}
        className={`group relative flex h-full w-full cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3 text-left shadow-sm transition-all duration-200 hover:border-border-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender ${
          isPending ? "opacity-60" : "opacity-100"
        }`}
      >
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: `${category.color}1f`, color: category.color }}
          aria-hidden="true"
        >
          <DynamicIcon name={category.icon} className="size-5" style={{ color: category.color }} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold leading-tight text-foreground">
            {category.name}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {category.subcategoryCount}{" "}
            {category.subcategoryCount === 1 ? "actividad" : "actividades"}
          </span>
        </span>
        <span className="text-muted-foreground/60 transition-colors duration-200 group-hover:text-accent-aprender">
          <ChevronRight className="size-4" />
        </span>
        {isPending && (
          <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-surface/70 backdrop-blur-sm">
            <span className="size-5 animate-spin rounded-full border-2 border-accent-aprender border-t-transparent" />
          </span>
        )}
      </button>
    </motion.div>
  );
}
