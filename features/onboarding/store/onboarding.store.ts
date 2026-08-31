import { create } from "zustand";

type OnboardingState = {
  welcomeDone: boolean;
  moodOpen: boolean;
  setWelcomeDone: (value: boolean) => void;
  setMoodOpen: (value: boolean) => void;
};

/**
 * Marca el fin del modal de bienvenida para desencadenar en Home el check de
 * planificación y los demás flujos post-login sin que dos modales compitan.
 * También controla el modal "¿Cómo te sientes hoy?" desde cualquier parte.
 */
export const useOnboardingStore = create<OnboardingState>((set) => ({
  welcomeDone: false,
  moodOpen: false,
  setWelcomeDone: (value) => set({ welcomeDone: value }),
  setMoodOpen: (value) => set({ moodOpen: value }),
}));
