import api from "@p40/lib/axios";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { EventResponse } from "@p40/common/contracts/event/event";

export async function eventByChurchId(
  churchId: string
): Promise<EventResponse | null> {
  try {
    const response = await api.get(`/api/event?churchId=${churchId}`);

    return response.data;
  } catch (error) {
    throw new FailException({
      message: error.response?.data?.message || "Usuário ou senha incorretos.",
      statusCode: error.response?.status || 500,
    });
  }
}
