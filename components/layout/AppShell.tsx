"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck2,
  HelpCircle,
  History,
  Home,
  LogOut,
  Menu,
  Settings2,
  SlidersHorizontal,
  Trash2,
  UserRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AppGuideModal } from "@/components/ui/AppGuideModal";
import { WelcomeModal } from "@/components/ui/WelcomeModal";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { AppBackProvider } from "@/components/layout/AppBackContext";
import { Logo } from "@/components/ui/Logo";
import { logoutAction } from "@/features/auth/actions/logout.action";
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
import {
  clearAppNavigationHistory,
  recordAppPath,
} from "@/lib/navigation-history";
import { useAppBack } from "@/lib/use-app-back";
import { cn } from "@/lib/utils";

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender",
        active
          ? "bg-surface-muted text-accent-aprender"
          : "text-foreground hover:bg-surface-muted",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AppShell({ userName, children }: { userName: string; children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === ROUTES.home;
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const backOverrideRef = useRef<(() => void) | null>(null);
  const appBack = useAppBack();
  const handleBack = useCallback(() => {
    if (backOverrideRef.current) {
      backOverrideRef.current();
      return;
    }
    appBack();
  }, [appBack]);
  const registerBackHandler = useCallback((handler: (() => void) | null) => {
    backOverrideRef.current = handler;
  }, []);
  // Onboarding post-login con una sola máquina de estados (mismo
  // comportamiento que el cableado disperso anterior).
  const onboarding = useOnboardingMachine();

  useEffect(() => {
    recordAppPath(pathname);
  }, [pathname]);

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
      clearAppNavigationHistory();
    } catch {
      // Storage unavailable.
    }
  }, []);

  return (
    <AppBackProvider register={registerBackHandler}>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
        <Link href={ROUTES.home} aria-label="Ir al inicio" title="Ir al inicio">
          <Logo />
        </Link>

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
          <form action={logoutAction}>
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
            className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender min-[1030px]:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      <aside className="fixed top-16 bottom-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-surface min-[1030px]:flex">
        <nav
          aria-label="Navegación principal"
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
        >
          <SidebarLink
            href={ROUTES.home}
            icon={Home}
            label="Inicio"
            active={pathname === ROUTES.home}
          />
          <SidebarLink
            href={ROUTES.activityView()}
            icon={Settings2}
            label="Actividades"
            active={pathname === ROUTES.activityView()}
          />
          <button
            type="button"
            onClick={() => usePlanningStore.getState().open()}
            aria-label="Abrir planificación"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
          >
            <CalendarCheck2 className="size-4 shrink-0" />
            <span className="truncate">Planificación</span>
          </button>
          <SidebarLink
            href={ROUTES.customize}
            icon={SlidersHorizontal}
            label="Personalizar"
            active={pathname === ROUTES.customize}
          />
          <SidebarLink
            href={ROUTES.history}
            icon={History}
            label="Historial"
            active={pathname === ROUTES.history}
          />
          <SidebarLink
            href={ROUTES.trash}
            icon={Trash2}
            label="Papelera"
            active={pathname === ROUTES.trash}
          />
          <SidebarLink
            href={ROUTES.account}
            icon={UserRound}
            label="Cuenta"
            active={pathname === ROUTES.account}
          />
        </nav>
      </aside>

      <div className="flex flex-1 flex-col min-[1030px]:pl-60">
        <main
          className={cn(
            "flex flex-1 flex-col px-4 pb-8 sm:px-6",
            isHome ? "pt-4 sm:pt-6" : "pt-1",
          )}
        >
          {!isHome && (
            <div className="mb-1 flex items-center">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Volver"
                title="Volver"
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-aprender"
              >
                <ArrowLeft className="size-4" />
              </button>
            </div>
          )}
          {children}
        </main>
      </div>

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
    </AppBackProvider>
  );
}
