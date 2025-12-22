import { create } from "zustand";

export const useOnboardingStore = create((set) => ({
  stepData: {},
  updateData: (payload) =>
    set((state) => ({ stepData: { ...state.stepData, ...payload } })),
  reset: () => set({ stepData: {} })
}));
