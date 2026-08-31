"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarCheck2, History, Home, LogOut, Menu, Settings2, SlidersHorizontal } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AppGuideModal } from "@/components/ui/AppGuideModal";
import { WelcomeModal } from "@/components/ui/WelcomeModal";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Logo } from "@/components/ui/Logo";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { usePlanningStore } from "@/features/planning/store/planning.store";
import { PlanningManager } from "@/features/planning/components/PlanningManager";
import { PlanContinuePrompt } from "@/features/planning/components/PlanContinuePrompt";
import { MoodModal } from "@/features/recommendation/components/MoodModal";
import { useSessionStore } from "@/features/session/store/session.store";
import { hasAnsweredMoodToday } from "@/features/recommendation/mood.storage";
import { ResumeSessionPrompt } from "@/features/session/components/ResumeSessionPrompt";
import { useOnboardingStore } from "@/features/onboarding/store/onboarding.store";
import { getTodayPlanAction, saveTodayPlanAction } from "@/features/planning/actions/planning.actions";
import { todayKey } from "@/lib/day";

const GUIDE_STORAGE_KEY = "gosession-guide-seen";
const WELCOME_STORAGE_PREFIX = "gosession-welcome-seen";

function getWelcomeKey() {
  return `${WELCOME_STORAGE_PREFIX}-${todayKey()}`;
}

export function AppShell({ userName, children }: { userName: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/app/home";
  const [menuOpen, setMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [planContinueOpen, setPlanContinueOpen] = useState(false);
  // Cuando el usuario opta por no continuar la planificación, la guía se
  // muestra antes de redirigir al home.
  const [redirectAfterGuide, setRedirectAfterGuide] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(getWelcomeKey()) !== "1";
    } catch {
      return true;
    }
  });
  const storeMoodOpen = useOnboardingStore((state) => state.moodOpen);
  const setStoreMoodOpen = useOnboardingStore((state) => state.setMoodOpen);

  const closeGuide = useCallback(() => {
    setGuideOpen(false);
    try {
      window.sessionStorage.setItem(GUIDE_STORAGE_KEY, "1");
    } catch {
      // Storage unavailable.
    }
    if (redirectAfterGuide) {
      setRedirectAfterGuide(false);
      router.push("/app/home");
    }
  }, [router, redirectAfterGuide]);

  const closeWelcome = useCallback(() => {
    setWelcomeOpen(false);
    try {
      window.localStorage.setItem(getWelcomeKey(), "1");
    } catch {
      // Storage unavailable.
    }
    useOnboardingStore.getState().setWelcomeDone(true);
  }, []);

  const markWelcomeDismissedForToday = useCallback(() => {
    try {
      window.localStorage.setItem(getWelcomeKey(), "1");
    } catch {
      // Storage unavailable.
    }
  }, []);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/app/home");
    }
  }, [router]);

  useEffect(() => {
    void useSessionStore.persist.rehydrate();
  }, []);

  const clearOnboardingKeys = useCallback(() => {
    try {
      window.sessionStorage.removeItem(GUIDE_STORAGE_KEY);
      window.localStorage.removeItem(getWelcomeKey());
      window.sessionStorage.removeItem("gosession-categories-auto-opened");
      window.sessionStorage.removeItem("gosession-personalize-seen");
    } catch {
      // Storage unavailable.
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-40 bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          {!isHome && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Volver"
              title="Volver"
              className="flex size-10 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}
          <Link href="/app/home" aria-label="Ir al inicio" title="Ir al inicio">
            <Logo />
          </Link>
        </div>
        <div className="hidden items-center gap-4 min-[600px]:flex">
          <Link
            href="/app/home"
            aria-label="Ir a home"
            title="Ir a home"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <Home className="size-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <button
            type="button"
            onClick={() => usePlanningStore.getState().open()}
            aria-label="Editar planificación del día"
            title="Editar planificación del día"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <CalendarCheck2 className="size-4" />
            <span className="hidden sm:inline">Planificación</span>
          </button>
          <Link
            href="/app/subcategories"
            aria-label="Editar Actividades"
            title="Editar Actividades"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <Settings2 className="size-4" />
            <span className="hidden sm:inline">Actividades</span>
          </Link>
          <Link
            href="/app/routine"
            aria-label="Personaliza tu rutina como más te acomode."
            title="Personaliza tu rutina como más te acomode."
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <SlidersHorizontal className="size-4" />
            <span className="hidden sm:inline">Personalizar</span>
          </Link>
          <Link
            href="/app/history"
            aria-label="Ver historial"
            title="Ver historial"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <History className="size-4" />
            <span className="hidden sm:inline">Historial</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={logoutAction} className="hidden min-[600px]:flex">
            <button
              type="submit"
              onClick={clearOnboardingKeys}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-border text-foreground transition-colors duration-300 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              <LogOut className="size-5" />
            </button>
          </form>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            title="Abrir menú"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-border text-foreground transition-colors duration-300 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender min-[600px]:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>
      {!isHome && <Breadcrumbs pathname={pathname} />}
      </div>
      <main className="flex flex-1 flex-col px-4 py-12 sm:px-6">{children}</main>
      <PlanningManager />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <AppGuideModal open={guideOpen} onClose={closeGuide} />
      <WelcomeModal
        open={welcomeOpen}
        userName={userName}
        onPersonalize={() => {
          closeWelcome();
          router.push("/app/routine");
        }}
        onPlan={() => {
          closeWelcome();
          usePlanningStore.getState().open();
        }}
        onLearn={() => {
          closeWelcome();
          getTodayPlanAction().then((result) => {
            if (result.success && result.plan && result.plan.items.length > 0) {
              setPlanContinueOpen(true);
            } else {
              setGuideOpen(true);
            }
          });
        }}
        onSkip={() => {
          closeWelcome();
          try { sessionStorage.setItem("gosession-show-categories", "1"); } catch {}
          usePlanningStore.getState().bumpPlanVersion();
          if (!hasAnsweredMoodToday()) {
            setStoreMoodOpen(true);
          }
        }}
        onDontShowToday={markWelcomeDismissedForToday}
      />
      <PlanContinuePrompt
        open={planContinueOpen}
        onKeepPlan={() => {
          setPlanContinueOpen(false);
          setGuideOpen(true);
        }}
        onStartFresh={async () => {
          setPlanContinueOpen(false);
          await saveTodayPlanAction([]);
          try { sessionStorage.setItem("gosession-show-categories", "1"); } catch {}
          // Mostrar el modal informativo antes de ir al home.
          setRedirectAfterGuide(true);
          setGuideOpen(true);
        }}
      />
      <MoodModal open={storeMoodOpen} userName={userName} onClose={() => {
        setStoreMoodOpen(false);
        window.dispatchEvent(new CustomEvent("gosession-expand-categories"));
      }} />
      {!pathname.startsWith("/app/session") && <ResumeSessionPrompt userName={userName} />}
    </div>
  );
}
