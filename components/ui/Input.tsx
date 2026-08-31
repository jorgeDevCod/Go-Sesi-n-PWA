import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-12 w-full rounded-xl border border-border bg-surface px-4 text-base text-foreground placeholder:text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender focus-visible:border-accent-aprender/30",
          error && "border-red-400 focus-visible:ring-red-400 focus-visible:border-red-400/30",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
