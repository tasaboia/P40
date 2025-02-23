import api from "@p40/lib/axios";
import { FailException } from "@p40/common/contracts/exceptions/exception";

export async function dashboardData(eventId: string): Promise<{
  success: boolean;
  stats: {
    distinctLeaders: string;
    singleLeaderSlots: string;
    filledTimeSlots: string;
    emptyTimeSlots: string;
  };
}> {
  try {
    const response = await api.get(`/api/dashboard?eventId=${eventId}`);

    return response.data;
  } catch (error) {
    throw new FailException({
      message: error.response?.data?.message || "Erro buscar dashboard.",
      statusCode: error.response?.status || 500,
    });
  }
}
