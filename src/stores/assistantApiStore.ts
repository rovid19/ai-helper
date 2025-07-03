import { create } from "zustand";
import { AssistantApiService } from "../services/openAi/assistantApi";

interface AssistantApiState {
  assistantApiService: AssistantApiService | null;
  setAssistantApiService: (service: AssistantApiService | null) => void;
}

export const useAssistantApiStore = create<AssistantApiState>((set) => ({
  assistantApiService: null,
  setAssistantApiService: (service) => set({ assistantApiService: service }),
}));
