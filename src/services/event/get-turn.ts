import api from "@p40/lib/axios";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { PrayerTurnResponse } from "@p40/common/contracts/user/user";
interface GetTurnsParams {
  weekday?: number;
  eventId: string;
  userId?: string;
}

export async function getTurns(
  params: GetTurnsParams
): Promise<PrayerTurnResponse[] | null> {
  try {
    if (!params.eventId) {
      throw new FailException({
        message: "O parâmetro 'eventId' é obrigatório.",
        statusCode: 400,
      });
    }

    const searchParams = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, value!.toString()])
    );

    const response = await api.get(
      `/api/event/turn?${searchParams.toString()}`
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar turnos:", error);
    throw new FailException({
      message: error.response?.data?.message || "Erro ao buscar turnos.",
      statusCode: error.response?.status || 500,
    });
  }
}
