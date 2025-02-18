import api from "@p40/lib/axios";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { EventResponse } from "@p40/common/contracts/event/event";

export async function subscribe(
  userId: string,
  eventId: string,
  startTime: string,
  weekday: string
): Promise<EventResponse | null> {
  try {
    const response = await api.post(`/api/event/turn`, null, {
      params: {
        userId,
        eventId,
        startTime,
        weekday,
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
