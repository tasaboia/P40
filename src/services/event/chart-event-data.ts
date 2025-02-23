import { ChartEventResponse } from "@p40/common/contracts/event/event";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import api from "@p40/lib/axios";

export async function getChartEventData(
  eventId: string
): Promise<ChartEventResponse> {
  try {
    const response = await api.get(`/api/event/chart?eventId=${eventId}`);

    return response.data;
  } catch (error) {
    throw new FailException({
      message: error.response?.data?.message || "Erro ao buscar turnos.",
      statusCode: error.response?.status || 500,
    });
  }
}
