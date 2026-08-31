import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-aprender text-white hover:bg-accent-aprender-hover focus-visible:ring-accent-aprender shadow-sm",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-surface-hover focus-visible:ring-accent-aprender shadow-sm",
  ghost:
    "bg-transparent text-foreground hover:bg-surface-muted focus-visible:ring-accent-aprender",
  danger:
    "bg-transparent text-red-500 border border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 focus-visible:ring-red-400",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-base",
  lg: "h-14 px-8 text-lg",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl font-medium font-work transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonClassName({ variant, size, className })}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
