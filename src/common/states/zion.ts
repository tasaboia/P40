import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getChurchList } from "@p40/services/zion";
import { Church, ZionApiResponse } from "../contracts/church/zions";

interface SettingStore {
  zions: ZionApiResponse[] | null;
  selectedZion: Church | null;
  activeTab: string;
  setSelectedZion: (zion: Church) => void;
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
          const fetchedZions: ZionApiResponse[] = await getChurchList();
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
