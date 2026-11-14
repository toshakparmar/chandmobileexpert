import { create } from "zustand";

interface LoaderState {
  isLoading: boolean;
  text: string;
  startLoader: (text?: string) => void;
  stopLoader: () => void;
}

export const useLoaderStore = create<LoaderState>((set) => ({
  isLoading: false,
  text: "Loading...",
  startLoader: (text = "Loading...") => set({ isLoading: true, text }),
  stopLoader: () => set({ isLoading: false, text: "Loading..." }),
}));
