"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarCheck2, HelpCircle, History, Home, LogOut, Menu, SlidersHorizontal, Trash2, UserRound } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AppGuideModal } from "@/components/ui/AppGuideModal";
import { WelcomeModal } from "@/components/ui/WelcomeModal";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Logo } from "@/components/ui/Logo";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { usePlanningStore } from "@/features/planning/store/planning.store";
import { PlanningManager } from "@/features/planning/components/PlanningManager";
import { MoodModal } from "@/features/recommendation/components/MoodModal";
import { TrashUndoModal } from "@/features/categories/components/TrashUndoModal";
import { useSessionStore } from "@/features/session/store/session.store";
import { useServerPrefsSync } from "@/features/preferences/hooks/useServerPrefsSync";
import { useOnboardingMachine } from "@/features/onboarding/hooks/useOnboardingMachine";
import { useOfflineFlush } from "@/features/offline/hooks/useOfflineFlush";
import { ResumeSessionPrompt } from "@/features/session/components/ResumeSessionPrompt";
import { ROUTES } from "@/lib/routes";

export function AppShell({ userName, children }: { userName: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === ROUTES.home;
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  // Onboarding post-login con una sola máquina de estados (mismo
  // comportamiento que el cableado disperso anterior).
  const onboarding = useOnboardingMachine();

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(ROUTES.home);
    }
  }, [router]);

  useEffect(() => {
    void useSessionStore.persist.rehydrate();
  }, []);

  // Sincroniza prefs y ánimo con el servidor (best-effort, una vez).
  useServerPrefsSync();

  // Drena la cola offline al entrar y al recuperar la red.
  useOfflineFlush();

  const clearOnboardingKeys = useCallback(() => {
    try {
      // La guarda de bienvenida es por-día ("No mostrar más hoy") y NO se
      // limpia al cerrar sesión: persiste hasta el día siguiente.
      window.sessionStorage.removeItem("gosession-categories-auto-opened");
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
          <Link href={ROUTES.home} aria-label="Ir al inicio" title="Ir al inicio">
            <Logo />
          </Link>
        </div>
        <div className="hidden items-center gap-4 min-[600px]:flex">
          <Link
            href={ROUTES.home}
            aria-label="Ir a home"
            title="Ir a home"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent-aprender/40 hover:bg-surface-hover hover:text-accent-aprender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <Home className="size-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <button
            type="button"
            onClick={() => usePlanningStore.getState().open()}
            aria-label="Editar planificación del día"
            title="Editar planificación del día"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent-aprender/40 hover:bg-surface-hover hover:text-accent-aprender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <CalendarCheck2 className="size-4" />
            <span className="hidden sm:inline">Planificación</span>
          </button>
          <Link
            href={ROUTES.customize}
            aria-label="Personaliza tu rutina como más te acomode."
            title="Personaliza tu rutina como más te acomode."
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent-aprender/40 hover:bg-surface-hover hover:text-accent-aprender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <SlidersHorizontal className="size-4" />
            <span className="hidden sm:inline">Personalizar</span>
          </Link>
          <Link
            href={ROUTES.history}
            aria-label="Ver historial"
            title="Ver historial"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent-aprender/40 hover:bg-surface-hover hover:text-accent-aprender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <History className="size-4" />
            <span className="hidden sm:inline">Historial</span>
          </Link>
          <Link
            href={ROUTES.trash}
            aria-label="Ir a la papelera"
            title="Ir a la papelera"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent-aprender/40 hover:bg-surface-hover hover:text-accent-aprender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <Trash2 className="size-4" />
            <span className="hidden sm:inline">Papelera</span>
          </Link>
          <Link
            href={ROUTES.account}
            aria-label="Ir a cuenta"
            title="Ir a cuenta"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent-aprender/40 hover:bg-surface-hover hover:text-accent-aprender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <UserRound className="size-4" />
            <span className="hidden sm:inline">Cuenta</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            aria-label="Abrir ayuda"
            title="Ayuda"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <HelpCircle className="size-5" />
          </button>
          <ThemeToggle />
          <form action={logoutAction} className="hidden min-[600px]:flex">
            <button
              type="submit"
              onClick={clearOnboardingKeys}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
            >
              <LogOut className="size-5" />
            </button>
          </form>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            title="Abrir menú"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender min-[600px]:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>
      {!isHome && <Breadcrumbs pathname={pathname} />}
      </div>
      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6">{children}</main>
      <PlanningManager />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenHelp={() => {
          setMenuOpen(false);
          setHelpOpen(true);
        }}
      />
      <AppGuideModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <WelcomeModal
        open={onboarding.showWelcome}
        userName={userName}
        onConfirm={(option) => {
          if (option === "personalize") onboarding.choosePersonalize();
          else if (option === "plan") onboarding.choosePlan();
          else if (option === "recommend") onboarding.chooseRecommend();
          else onboarding.chooseStart();
        }}
        onSwitchAccount={() => {
          void logoutAction();
        }}
        onDontShowToday={onboarding.dismissToday}
      />
      <MoodModal open={onboarding.showMood} userName={userName} onClose={onboarding.closeMood} />
      <TrashUndoModal />
      {!pathname.startsWith(ROUTES.session) && <ResumeSessionPrompt userName={userName} />}
    </div>
  );
}
