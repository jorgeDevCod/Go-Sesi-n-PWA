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
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-aprender to-accent-trabajo text-sm font-bold text-white shadow-sm",
          iconClassName,
        )}
      >
        Go
      </span>
      {showWordmark && (
        <span className="font-display text-lg font-bold leading-none tracking-tight text-foreground">
          Sesión
        </span>
      )}
    </span>
  );
}
