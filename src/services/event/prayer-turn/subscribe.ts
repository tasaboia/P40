import api from "@p40/lib/axios";
import { FailException } from "@p40/common/contracts/exceptions/exception";

export async function subscribe(
  userId: string,
  eventId: string,
  startTime: string,
  weekday: number
) {
  try {
    const response = await api.post(
      `/api/event/turn?userId=${userId}&eventId=${eventId}&startTime=${startTime}&weekday=${weekday}`
    );

    return response.data;
  } catch (error) {
    throw new FailException({
      message:
        error.response?.data?.message || "Erro ao se inscrever no turno.",
      statusCode: error.response?.status || 500,
    });
  }
}
