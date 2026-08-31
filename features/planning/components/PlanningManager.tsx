"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePlanningStore } from "@/features/planning/store/planning.store";
import { PlanningModal, type PlanItem } from "@/features/planning/components/PlanningModal";
import { ExistingPlanPrompt } from "@/features/planning/components/ExistingPlanPrompt";
import {
  getPlanningContextAction,
  saveTodayPlanAction,
} from "@/features/planning/actions/planning.actions";

export function PlanningManager() {
  const router = useRouter();
  const isOpen = usePlanningStore((state) => state.isOpen);
  const isPromptOpen = usePlanningStore((state) => state.isPromptOpen);
  const context = usePlanningStore((state) => state.context);
  const open = usePlanningStore((state) => state.open);
  const close = usePlanningStore((state) => state.close);
  const closePrompt = usePlanningStore((state) => state.closePrompt);
  const setContext = usePlanningStore((state) => state.setContext);
  const bumpPlanVersion = usePlanningStore((state) => state.bumpPlanVersion);

  const fetchStartedRef = useRef(false);
  const [isSaving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen && !isPromptOpen) {
      fetchStartedRef.current = false;
      return;
    }
    if (context || fetchStartedRef.current) return;
    fetchStartedRef.current = true;
    getPlanningContextAction().then((result) => {
      if (result.success) {
        setContext(result.context);
      }
    });
  }, [isOpen, isPromptOpen, context, setContext]);

  function handleChangePlan() {
    closePrompt();
    open();
  }

  function handleSave(items: PlanItem[]) {
    startSaving(async () => {
      const result = await saveTodayPlanAction(
        items.map((item, index) => ({
          title: item.title,
          icon: item.icon,
          color: item.color,
          categoryId: item.categoryId,
          subcategoryId: item.subcategoryId,
          order: index,
        })),
      );
      if (result.success) {
        bumpPlanVersion();
        setSaved(true);
      }
    });
  }

  function handleSavedClose() {
    setSaved(false);
    close();
    router.refresh();
    window.dispatchEvent(new CustomEvent("gosession-scroll-to-plan"));
  }

  function handleSkip() {
    close();
    router.push("/app/session/recommend");
  }

  const needsContext = (isOpen || isPromptOpen) && !context;

  return (
    <>
      {needsContext && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-4 shadow-xl">
            <Loader2 className="size-5 animate-spin text-accent-aprender" />
            <span className="text-sm text-muted-foreground">Cargando tu planificación...</span>
          </div>
        </div>
      )}

      <ExistingPlanPrompt
        open={isPromptOpen && Boolean(context)}
        onKeep={closePrompt}
        onChange={handleChangePlan}
        isPending={false}
      />

      {isOpen && context && (
        <PlanningModal
          open={isOpen}
          userName={context.userName}
          categories={context.categories}
          existingItems={context.planItems}
          onClose={close}
          onSave={handleSave}
          onSkip={handleSkip}
          isPending={isSaving}
        />
      )}

      <AnimatePresence>
        {saved && (
          <PortalSuccess
            userName={context?.userName ?? ""}
            onClose={handleSavedClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function PortalSuccess({ userName, onClose }: { userName: string; onClose: () => void }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="presentation"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Plan guardado"
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-6 text-center shadow-xl"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-accent-aprender/10 text-accent-aprender">
          <PartyPopper className="size-7" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            ¡Plan listo, {userName}!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Hoy tienes todo lo que necesitas. ¡Tú puedes! 💪
          </p>
        </div>
        <Button size="lg" onClick={onClose} className="w-full">
          ¡A empezar!
        </Button>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
