"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

export type HomeSection = {
  id: string;
  label: string;
};

export function HomeSectionNav({ sections }: { sections: HomeSection[] }) {
  const [target, setTarget] = useState<string>(sections[0]?.id ?? "top");

  useEffect(() => {
    let frame: number | null = null;

    function update() {
      frame = null;
      const probe = window.scrollY + Math.min(window.innerHeight * 0.35, 260);
      let activeIndex = -1;

      sections.forEach((section, index) => {
        const element = document.getElementById(section.id);
        if (!element) return;
        const top = element.getBoundingClientRect().top + window.scrollY;
        if (probe >= top) activeIndex = index;
      });

      const nextIndex = activeIndex < 0 ? 0 : activeIndex + 1;
      setTarget(nextIndex >= sections.length ? "top" : sections[nextIndex].id);
    }

    function onScroll() {
      if (frame !== null) return;
      frame = requestAnimationFrame(update);
    }

    const initial = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(initial);
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  const isTop = target === "top";
  const section = sections.find((item) => item.id === target);
  const label = isTop ? "Ir a inicio" : section?.label ?? "Ir a categorías";

  function handleClick() {
    if (isTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document
      .getElementById(section?.id ?? "")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full bg-accent-aprender px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-accent-aprender/25 transition duration-200 hover:bg-accent-aprender-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender focus-visible:ring-offset-2 focus-visible:ring-offset-background min-[1030px]:left-[calc(50%_+_7.5rem)]"
    >
      {isTop ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
      {label}
    </button>
  );
}
