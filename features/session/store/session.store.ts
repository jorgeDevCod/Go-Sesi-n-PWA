import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SessionDTO } from "@/services/session/session.dto";

type SessionStoreState = {
  session: SessionDTO | null;
  skewMs: number;
  setSession: (dto: SessionDTO | null) => void;
  clearSession: () => void;
};

export const SESSION_STORAGE_KEY = "gosession-active-session";

/** Lee la sesión persistida sin esperar a la rehidratación de Zustand. */
export function readPersistedSession(): SessionDTO | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { session?: SessionDTO | null } };
    return parsed.state?.session ?? null;
  } catch {
    return null;
  }
}

export const useSessionStore = create<SessionStoreState>()(
  persist(
    (set) => ({
      session: null,
      skewMs: 0,
      setSession: (dto) =>
        set((state) => ({
          session: dto,
          skewMs: dto ? dto.serverNowMs - Date.now() : state.skewMs,
        })),
      clearSession: () => set({ session: null }),
    }),
    {
      name: SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Rehydrated manually on mount (see useActiveSession) so the server-
      // rendered HTML and the first client render match-avoids a
      // hydration-mismatch flash between "no session" and the cached one.
      skipHydration: true,
      partialize: (state) => ({ session: state.session, skewMs: state.skewMs }),
    },
  ),
);
