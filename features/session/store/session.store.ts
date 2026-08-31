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
