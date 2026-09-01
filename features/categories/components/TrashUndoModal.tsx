"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTrashUndoStore } from "@/features/categories/store/trash-undo.store";
import { trashRestoreAction } from "@/features/categories/actions/trash.actions";

const UNDO_SECONDS = 5;

export function TrashUndoModal() {
  const router = useRouter();
  const { open, kind, count, ids, clear } = useTrashUndoStore();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => clear(), UNDO_SECONDS * 1000);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open, clear]);

  if (typeof document === "undefined") return null;

  async function handleRestore() {
    const items = ids.map((id) => ({ kind, id }) as { kind: "category" | "subcategory"; id: string });
    const result = await trashRestoreAction({ items });
    if (result.success) {
      clear();
      router.refresh();
    }
  }

  const noun = kind === "category" ? "categorías" : "actividades";

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Eliminado con opción de restaurar"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-border bg-surface p-6 text-center shadow-xl"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
              <Trash2 className="size-6" />
            </span>

            <div className="flex flex-col gap-1.5">
              <h2 className="font-display text-lg font-semibold text-foreground">
                {count} {count === 1 ? "elemento eliminado" : "elementos eliminados"}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Las {noun} se irán a la papelera en caso de que desees restablecerlas. Tienes{" "}
                {UNDO_SECONDS} segundos para deshacer.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2">
              <Button size="lg" onClick={handleRestore} className="w-full gap-2">
                <RotateCcw className="size-4" />
                Restablecer
              </Button>
              <div className="flex w-full gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    clear();
                    router.push("/app/trash");
                  }}
                  className="flex-1 gap-2"
                >
                  <Eye className="size-4" />
                  Ir a papelera
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={clear}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
