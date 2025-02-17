import api from "@p40/lib/axios";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { PrayerTurnResponse } from "@p40/common/contracts/user/user";

export async function turnByWeekday(
  weekday: number,
  eventId: string
): Promise<PrayerTurnResponse[] | null> {
  try {
    const response = await api.get(
      `/api/event/turn?weekday=${weekday.toString()}&eventId=${eventId}`
    );

    return response.data;
  } catch (error) {
    throw new FailException({
      message: error.response?.data?.message || "Usuário ou senha incorretos.",
      statusCode: error.response?.status || 500,
    });
  }
}
