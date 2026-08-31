"use client";

import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

export function EnterCta({ className }: { className?: string }) {
  return (
    <Link
      href="/register"
      onClick={() => track("enter_space_click")}
      className={buttonClassName({ size: "lg", className })}
    >
      Entrar a mi espacio
    </Link>
  );
}
