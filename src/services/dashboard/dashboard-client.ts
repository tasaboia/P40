import {
  DashboardStatsResponse,
  LeadersDashboardResponse,
  ShiftResponse,
  SingleLeaderShiftResponse,
} from "@p40/common/contracts/dashboard/dashboard";
import api from "@p40/lib/axios";

export class DashboardClient {
  async getStats(): Promise<DashboardStatsResponse | null> {
    try {
      const data = await api.get("/api/dashboard/stats");
      return data.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return {
        error: error,
        success: false,
        data: {
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

  async getEventTurns(): Promise<ShiftResponse> {
    try {
      const data = await api.get("/api/dashboard/turns");
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

  async getSingleLeaderAndEmptyShifts(): Promise<SingleLeaderShiftResponse> {
    try {
      const data = await api.get("/api/dashboard/leaders");
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
  async getEventLeaders(): Promise<LeadersDashboardResponse> {
    try {
      const data = await api.get("/api/dashboard/leaders/all");
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

  async getTestemuny() {
    try {
      const data = await api.get("/api/dashboard/testimonies");
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
