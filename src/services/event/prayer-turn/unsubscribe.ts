import api from "@p40/lib/axios";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { EventResponse } from "@p40/common/contracts/event/event";

export async function unsubscribe(
  userId: string,
  prayerTurnId: string
): Promise<EventResponse | null> {
  try {
    const response = await api.delete(`/api/event/turn`, {
      params: {
        userId,
        prayerTurnId,
      },
    });

    return response.data;
  } catch (error) {
    throw new FailException({
      message:
        error.response?.data?.message || "Erro ao se inscrever no turno.",
      statusCode: error.response?.status || 500,
    });
  }
}
