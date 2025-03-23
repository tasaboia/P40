import {
  DashboardStatsResponse,
  LeadersDashboardResponse,
  ShiftResponse,
  SingleLeaderShiftResponse,
  TestimonyDashboardResponse,
} from "@p40/common/contracts/dashboard/dashboard";

export class DashboardServer {
  private baseUrl: string;
  private userId: string;

  constructor(userId: string) {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    this.userId = userId;
  }

  private async fetchWithAuth<T>(url: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.userId}`,
        "x-userId": this.userId, // Adicional para garantir
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    return response.json();
  }

  async getStats(): Promise<DashboardStatsResponse | null> {
    try {
      return await this.fetchWithAuth("/api/dashboard/stats");
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

  async getEventTurns(): Promise<ShiftResponse> {
    try {
      return await this.fetchWithAuth("/api/dashboard/turns");
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
      return await this.fetchWithAuth("/api/dashboard/leaders");
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
      return await this.fetchWithAuth("/api/dashboard/leaders/all");
    } catch (error) {
      console.error("Erro ao buscar Lideres em um so horário:", error);
      return {
        error: error,
        success: false,
        data: null,
      };
    }
  }

  async getTestemuny(): Promise<TestimonyDashboardResponse> {
    try {
      return await this.fetchWithAuth("/api/dashboard/testimonies");
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
