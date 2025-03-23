import {
  DashboardStatsResponse,
  LeadersDashboardResponse,
  ShiftResponse,
  SingleLeaderShiftResponse,
  TestimonyDashboardResponse,
} from "@p40/common/contracts/dashboard/dashboard";
import api from "@p40/lib/axios";

export class DashboardClient {
  async getStats(churchId: string): Promise<DashboardStatsResponse | null> {
    try {
      const data = await api.get(`/api/dashboard/stats?churchId=${churchId}`);
      return data.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return {
        error: error,
        success: false,
        data: {
          fullMaxParticipantsPerTurn: 0,
          totalLeaders: 0,
          totalEvents: 0,
          totalPrayerTurns: 0,
          filledPrayerTurns: 0,
          partialPrayerTurns: 0,
          emptyPrayerTurns: 0,
          leadersPercentage: 0,
          shiftsPercentage: 0,
        },
      };
    }
  }

  async getEventTurns(churchId: string): Promise<ShiftResponse> {
    try {
      const data = await api.get(`/api/dashboard/turns?churchId=${churchId}`);
      return data.data;
    } catch (error) {
      console.error("Erro ao buscar atividades recentes:", error);
      return {
        error: error,
        success: false,
        data: null,
      };
    }
  }

  async getSingleLeaderAndEmptyShifts(
    churchId: string
  ): Promise<SingleLeaderShiftResponse> {
    try {
      const data = await api.get(`/api/dashboard/leaders?churchId=${churchId}`);
      return data.data;
    } catch (error) {
      console.error("Erro ao buscar Lideres em um so horário:", error);
      return {
        error: error,
        success: false,
        data: null,
      };
    }
  }
  async getEventLeaders(churchId: string): Promise<LeadersDashboardResponse> {
    try {
      const data = await api.get(
        `/api/dashboard/leaders/all?churchId=${churchId}`
      );
      return data.data;
    } catch (error) {
      console.error("Erro ao buscar Lideres em um so horário:", error);
      return {
        error: error,
        success: false,
        data: null,
      };
    }
  }

  async getTestemuny(churchId: string): Promise<TestimonyDashboardResponse> {
    try {
      const data = await api.get(
        `/api/dashboard/testimonies?churchId=${churchId}`
      );
      return data.data;
    } catch (error) {
      console.error("Erro ao buscar testemunhos:", error);

      return {
        error: error,
        success: false,
        data: null,
      };
    }
  }
}
