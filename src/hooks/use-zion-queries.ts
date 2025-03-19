import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSettingStore } from "@p40/common/states/zion";
import { Church, ZionApiResponse } from "@p40/common/contracts/church/zions";

export const useZionQueries = () => {
  const queryClient = useQueryClient();
  const { fetchZions, setSelectedZion: setSelectedZionStore } =
    useSettingStore();

  // Query para buscar as igrejas
  const {
    data: zions,
    isLoading,
    error,
  } = useQuery<ZionApiResponse[]>({
    queryKey: ["zions"],
    queryFn: async () => {
      await fetchZions();
      return useSettingStore.getState().zions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });

  // Mutation para atualizar a igreja selecionada
  const { mutate: setSelectedZion } = useMutation({
    mutationFn: (church: Church) => {
      setSelectedZionStore(church);
      return Promise.resolve(church);
    },
    onSuccess: () => {
      // Invalida o cache se necessário
      queryClient.invalidateQueries({ queryKey: ["zions"] });
    },
  });

  return {
    zions,
    isLoading,
    error,
    setSelectedZion,
  };
};
