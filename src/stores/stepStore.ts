import { create } from "zustand";

export interface Step {
  targetText: string | null;
  description: string;
}

interface StepState {
  steps: Step[] | null;
  currentStepIndex: number | null;
  screenshotBase64: string | null;
  userStuckOn: Step | null;
  userQuestion: string | null;

  setSteps: (steps: Step[] | null) => void;
  setCurrentStepIndex: (index: number | null) => void;
  setScreenshotBase64: (screenshot: string | null) => void;
  setUserQuestion: (question: string | null) => void;
}

export const useStepStore = create<StepState>((set, get) => ({
  steps: null,
  currentStepIndex: null,
  screenshotBase64: null,
  userStuckOn: null,
  userQuestion: null,

  setSteps: (newSteps: Step[] | null) =>
    set((state) => {
      // If currentStepIndex exists, combine old and new steps
      if (state.currentStepIndex) {
        const oldSteps = (state.steps as Step[]).slice(
          0,
          state.currentStepIndex
        );
        return {
          steps: [...oldSteps, ...(newSteps as Step[])],
          currentStepIndex: state.currentStepIndex,
        };
      }
      // Otherwise just set new steps
      return {
        steps: newSteps,
        currentStepIndex: 0,
      };
    }),

  // Updates both the current step index and tracks which step the user is stuck on.
  // If index is valid, sets userStuckOn to that step, otherwise sets it to null
  setCurrentStepIndex: (index: number | null) => {
    set((state) => ({
      currentStepIndex: index,
      userStuckOn:
        index !== null ? ((state.steps as Step[])[index] as Step) : null,
    }));
  },
  setScreenshotBase64: (screenshot) => set({ screenshotBase64: screenshot }),
  setUserQuestion: (question) => set({ userQuestion: question }),
}));
