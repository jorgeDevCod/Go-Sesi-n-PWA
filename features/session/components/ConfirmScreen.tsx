import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { COUNTDOWN_OPTIONS } from "@/features/session/countdown-preference";

function countdownLabel(seconds: number): string {
  return seconds === 0 ? "Sin cuenta regresiva" : `${seconds} seg`;
}

export function ConfirmScreen({
  subcategoryName,
  categoryName,
  minutes,
  countdownSeconds,
  onCountdownChange,
  onConfirm,
  onBack,
  isPending,
  icon,
  color,
}: {
  subcategoryName: string;
  categoryName?: string;
  minutes: number;
  countdownSeconds: number;
  onCountdownChange: (seconds: number) => void;
  onConfirm: () => void;
  onBack: () => void;
  isPending: boolean;
  icon?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        {icon && (
          <span
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-sm"
            style={{ backgroundColor: `${color}33`, color }}
          >
            <DynamicIcon name={icon} className="size-7" />
          </span>
        )}
        <p className="text-sm text-muted-foreground">Comenzar sesión</p>
        <div className="flex flex-col items-center">
          <span className="text-6xl font-bold tabular-nums text-foreground">{minutes}</span>
          <span className="text-sm font-medium text-muted-foreground">minutos</span>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Vas a dedicar <span className="font-medium text-foreground">{minutes} minutos</span> a{" "}
          <span className="font-medium text-foreground">{subcategoryName}</span>
          {categoryName && <span> · {categoryName}</span>}. ¡Tú puedes!
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">Cuenta regresiva antes de empezar</p>
        <div className="flex flex-wrap justify-center gap-2">
          {COUNTDOWN_OPTIONS.map((seconds) => (
            <motion.button
              key={seconds}
              type="button"
              onClick={() => onCountdownChange(seconds)}
              title={countdownLabel(seconds)}
              aria-pressed={countdownSeconds === seconds}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.08 }}
              className={cn(
                "cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
                countdownSeconds === seconds
                  ? "border-accent-aprender bg-surface-muted"
                  : "bg-surface",
              )}
            >
              {countdownLabel(seconds)}
            </motion.button>
          ))}
        </div>
      </div>

      <Button
        size="lg"
        onClick={onConfirm}
        disabled={isPending}
        className="w-full max-w-xs"
      >
        {isPending ? <><Loader2 className="size-5 animate-spin" /> Comenzando...</> : "COMENZAR"}
      </Button>
      <motion.button
        type="button"
        onClick={onBack}
        disabled={isPending}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.08 }}
        title="Elegir otro tiempo"
        className="cursor-pointer text-sm text-muted-foreground underline"
      >
        Elegir otro tiempo
      </motion.button>
    </div>
  );
}
