import { EventResponse } from "@p40/common/contracts/event/event";
import api from "@p40/lib/axios";

export const eventByUserEmail = async (
  userEmail: string
): Promise<EventResponse> => {
  try {
    const response = await api.get(`/api/event?email=${userEmail}`);

    if (!response.data.success) {
      throw new Error("Evento não encontrado para este usuário");
    }

    return response.data.event;
  } catch (error) {
    console.error("Erro ao buscar evento pelo email:", error);
    throw new Error("Não foi possível carregar os dados do evento");
  }
};
