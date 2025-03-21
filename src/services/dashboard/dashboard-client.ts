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
      console.log(data.data);
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

  async getEventStats() {
    try {
      // Dados simulados de eventos
      return [
        {
          id: "1",
          name: "24 Horas de Oração",
          totalTurns: 48,
          filledTurns: 42,
          emptyTurns: 6,
          fillRate: 87.5,
          distinctLeaders: 35,
        },
        {
          id: "2",
          name: "Semana de Jejum",
          totalTurns: 42,
          filledTurns: 28,
          emptyTurns: 14,
          fillRate: 66.7,
          distinctLeaders: 22,
        },
        {
          id: "3",
          name: "Vigília Mensal",
          totalTurns: 24,
          filledTurns: 18,
          emptyTurns: 6,
          fillRate: 75.0,
          distinctLeaders: 15,
        },
      ];
    } catch (error) {
      console.error("Erro ao buscar estatísticas de eventos:", error);
      return [];
    }
  }

  async getWeekdayDistribution() {
    try {
      // Distribuição simulada por dia da semana
      return [
        { day: 0, total: 24, filled: 18, empty: 6 },
        { day: 1, total: 24, filled: 20, empty: 4 },
        { day: 2, total: 24, filled: 16, empty: 8 },
        { day: 3, total: 24, filled: 22, empty: 2 },
        { day: 4, total: 24, filled: 19, empty: 5 },
        { day: 5, total: 24, filled: 15, empty: 9 },
        { day: 6, total: 24, filled: 14, empty: 10 },
      ];
    } catch (error) {
      console.error("Erro ao buscar distribuição por dia da semana:", error);
      return Array(7)
        .fill(0)
        .map((_, i) => ({
          day: i,
          total: 0,
          filled: 0,
          empty: 0,
        }));
    }
  }

  async getRecentActivity() {
    try {
      // Atividades recentes simuladas
      const mockActivities = [
        {
          id: "1",
          type: "join",
          user: {
            id: "1",
            name: "João Silva",
            imageUrl: "https://i.pravatar.cc/150?img=1",
          },
          event: {
            id: "1",
            name: "24 Horas de Oração",
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
          weekday: 1,
          time: "08:00",
        },
        {
          id: "2",
          type: "join",
          user: {
            id: "2",
            name: "Maria Oliveira",
            imageUrl: "https://i.pravatar.cc/150?img=5",
          },
          event: {
            id: "1",
            name: "24 Horas de Oração",
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
          weekday: 2,
          time: "10:00",
        },
        {
          id: "3",
          type: "join",
          user: {
            id: "3",
            name: "Pedro Santos",
            imageUrl: "https://i.pravatar.cc/150?img=3",
          },
          event: {
            id: "2",
            name: "Semana de Jejum",
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 horas atrás
          weekday: 3,
          time: "14:00",
        },
        {
          id: "4",
          type: "join",
          user: {
            id: "4",
            name: "Ana Costa",
            imageUrl: "https://i.pravatar.cc/150?img=4",
          },
          event: {
            id: "3",
            name: "Vigília Mensal",
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 horas atrás
          weekday: 4,
          time: "22:00",
        },
        {
          id: "5",
          type: "join",
          user: {
            id: "5",
            name: "Lucas Ferreira",
            imageUrl: "https://i.pravatar.cc/150?img=7",
          },
          event: {
            id: "1",
            name: "24 Horas de Oração",
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 horas atrás
          weekday: 5,
          time: "06:00",
        },
        {
          id: "6",
          type: "join",
          user: {
            id: "6",
            name: "Camila Almeida",
            imageUrl: null,
          },
          event: {
            id: "2",
            name: "Semana de Jejum",
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
          weekday: 6,
          time: "16:00",
        },
      ];

      return mockActivities.slice(0);
    } catch (error) {
      console.error("Erro ao buscar atividades recentes:", error);
      return [];
    }
  }

  async getEventTurns(): Promise<ShiftResponse> {
    try {
      const data = await api.get("/api/dashboard/turns");
      console.log(data);
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
