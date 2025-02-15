import { create } from "zustand";
import { Zion } from "@p40/commons/types/zions/zions";

interface ZionStore {
  selectedZion: Zion | null;
  setSelectedZion: (zion: Zion) => void;
}

export const useZionStore = create<ZionStore>((set) => ({
  selectedZion: null, // Estado inicial vazio
  setSelectedZion: (zion) => set({ selectedZion: zion }),
}));
