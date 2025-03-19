import { User } from "@p40/common/contracts/user/user";
import { EventResponse } from "@p40/common/contracts/event/event";
import api from "@p40/lib/axios";

export interface DashboardAllData {
  user: User | null;
  event: EventResponse | null;
  prayerTurns: any[];
  turns: any[];
  stats: {
    distinctLeaders: string;
    singleLeaderSlots: string;
    filledTimeSlots: string;
    emptyTimeSlots: string;
  };
  chartData: any;
  users: any[];
}

export interface DashboardAllResponse {
  success: boolean;
  data: DashboardAllData | null;
  error?: string;
  warnings?: string[]; // Lista de avisos para serviços que falharam mas não impediram a operação
}

export const getDashboardAllData = async (
  userId: string
): Promise<DashboardAllResponse> => {
  try {
    const response = await api.get(`/api/dashboard/all?userId=${userId}`);

    if (!response.data.success) {
      throw new Error(response.data.error || "Erro ao carregar dashboard");
    }

    return response.data;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
};
