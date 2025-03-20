import api from "@p40/lib/axios";
import { PrayerTurnResponse } from "@p40/common/contracts/user/user";

export const getPrayerTurns = async (
  userId: string
): Promise<{ prayerTurn: PrayerTurnResponse[] }> => {
  try {
    const response = await api.get(`/api/prayer-turn?userId=${userId}`);
    return response.data;
  } catch (error) {
    return {
      prayerTurn: [],
    };
  }
};
