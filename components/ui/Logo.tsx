import { cn } from "@/lib/utils";

export function Logo({
  className,
  iconClassName,
  showWordmark = true,
}: {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-aprender text-xs font-bold text-white",
          iconClassName,
        )}
      >
        Go
      </span>
      {showWordmark && (
        <span className="text-lg font-semibold text-foreground">Sesión</span>
      )}
    </span>
  );
}
