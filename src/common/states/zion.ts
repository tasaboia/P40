import { create } from "zustand";
import { persist } from "zustand/middleware"; // Middleware para salvar no localStorage
import { Zion, ZionApiResponse } from "@p40/common/types/zions/zions";
import { getZions } from "@p40/services/zion";

interface SettingStore {
  zions: ZionApiResponse | null;
  selectedZion: Zion | null;
  activeTab: string;
  setSelectedZion: (zion: Zion) => void;
  setActiveTab: (tab: string) => void;
  fetchZions: () => Promise<void>;
}

export const useSettingStore = create(
  persist<SettingStore>(
    (set, get) => ({
      zions: null,
      selectedZion: null,
      activeTab: "zion",
      setSelectedZion: (zion) =>
        set({ selectedZion: zion, activeTab: "login" }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      fetchZions: async () => {
        if (get().zions) return;
        try {
          const fetchedZions = await getZions();
          set({ zions: fetchedZions });
        } catch (error) {
          console.error("Erro ao buscar as Zions:", error);
        }
      },
    }),
    {
      name: "zion-storage",
    }
  )
);
