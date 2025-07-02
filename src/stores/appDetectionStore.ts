import { create } from "zustand";

interface AppDetectionState {
  activeApp: string | null;
  activeWebApp: string | null;
  setActiveApp: (app: string | null) => void;
  setActiveWebApp: (webApp: string | null) => void;
}

export const useAppDetectionStore = create<AppDetectionState>((set) => ({
  activeApp: null,
  activeWebApp: null,
  setActiveApp: (app) => set({ activeApp: app }),
  setActiveWebApp: (webApp) => set({ activeWebApp: webApp }),
}));
