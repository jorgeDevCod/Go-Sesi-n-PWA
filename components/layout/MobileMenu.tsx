"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarCheck2,
  History,
  Home,
  LogOut,
  Settings2,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { usePlanningStore } from "@/features/planning/store/planning.store";

type MenuItem = {
  label: string;
  icon: typeof History;
  href?: string;
  action?: () => void;
};

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  const items: MenuItem[] = [
    { label: "Inicio", icon: Home, href: "/app/home" },
    {
      label: "Planificación",
      icon: CalendarCheck2,
      action: () => {
        onClose();
        usePlanningStore.getState().open();
      },
    },
    { label: "Actividades", icon: Settings2, href: "/app/subcategories" },
    { label: "Historial", icon: History, href: "/app/history" },
    { label: "Papelera", icon: Trash2, href: "/app/trash" },
    { label: "Personaliza tu rutina como más te acomode.", icon: SlidersHorizontal, href: "/app/routine" },
  ];

  function handleNavigate(href: string) {
    onClose();
    router.push(href);
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            onClick={(event) => event.stopPropagation()}
            className="absolute top-0 right-0 flex h-full w-[82%] max-w-xs flex-col gap-3 border-l border-border bg-surface p-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                title="Cerrar menú"
                className="flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-2 pt-2">
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    item.href ? handleNavigate(item.href) : item.action?.()
                  }
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-left text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
                >
                  <item.icon className="size-5 text-muted-foreground" />
                  {item.label}
                </button>
              ))}
            </nav>

            <form action={logoutAction} className="mt-auto flex flex-col gap-2">
              <button
                type="submit"
                onClick={() => {
                  try {
                    window.sessionStorage.removeItem("gosession-guide-seen");
                    window.sessionStorage.removeItem("gosession-welcome-seen");
                  } catch {
                    // Storage unavailable.
                  }
                  onClose();
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-red-200 bg-transparent px-4 py-3 text-left text-sm font-medium text-red-500 transition-colors duration-200 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-900 dark:hover:bg-red-950"
              >
                <LogOut className="size-5" />
                Cerrar sesión
              </button>
            </form>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
