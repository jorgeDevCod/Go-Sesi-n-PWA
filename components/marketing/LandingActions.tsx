"use client";

import { useState } from "react";
import { Download, HelpCircle, Check } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import { AppGuideModal } from "@/components/ui/AppGuideModal";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { track } from "@/lib/analytics";

export function LandingActions() {
  const [guideOpen, setGuideOpen] = useState(false);
  const { canInstall, installed, install } = usePwaInstall();

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
      {installed ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
          <Check className="size-4" />
          App instaladaF
        </span>
      ) : (
        <button
          type="button"
          onClick={() => {
            track("install_app_click", { canInstall });
            if (canInstall) void install();
            else setGuideOpen(true);
          }}
          className={buttonClassName({ size: "lg", variant: "secondary" })}
        >
          <Download className="size-4" />
          Instalar App
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          track("demo_click");
          setGuideOpen(true);
        }}
        className={buttonClassName({ size: "lg", variant: "secondary" })}
      >
        <HelpCircle className="size-4" />
        Descubre cómo funciona
      </button>

      <AppGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
