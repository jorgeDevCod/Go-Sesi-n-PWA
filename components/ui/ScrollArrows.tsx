"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Flechas para desplazar filas horizontales (scrollBy suave). Se ocultan
 * automáticamente cuando no hay más contenido hacia un lado.
 */
export function ScrollArrows({
  containerRef,
  className,
}: {
  containerRef: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      setCanLeft(false);
      setCanRight(false);
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 4);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [containerRef, update]);

  function scroll(direction: "left" | "right") {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -el.clientWidth * 0.7 : el.clientWidth * 0.7,
      behavior: "smooth",
    });
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <motion.button
        type="button"
        onClick={() => scroll("left")}
        disabled={!canLeft}
        aria-label="Desplazar a la izquierda"
        title="Desplazar a la izquierda"
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.08 }}
        className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors duration-200 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
      >
        <ChevronLeft className="size-5" />
      </motion.button>
      <motion.button
        type="button"
        onClick={() => scroll("right")}
        disabled={!canRight}
        aria-label="Desplazar a la derecha"
        title="Desplazar a la derecha"
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.08 }}
        className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors duration-200 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
      >
        <ChevronRight className="size-5" />
      </motion.button>
    </div>
  );
}
