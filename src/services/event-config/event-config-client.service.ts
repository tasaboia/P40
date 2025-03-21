import api from "@p40/lib/axios";

export class EventConfigClient {
  async getEventConfig() {
    try {
      const data = await api.get("/api/event-config");
      return data.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return {
        error: error,
        success: false,
        data: null,
      };
    }
  }
  async updateEventConfig(eventConfig: {
    id: string;
    name: string;
    description: string;
    churchId: string;
    churchName: string;
    startDate: Date;
    endDate: Date;
    leadersPerShift: number;
    allowShiftChange: boolean;
    eventType: string;
    shiftDuration: number;
  }) {
    try {
      const data = await api.post("/api/event-config", eventConfig);
      return data.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return {
        error: error,
        success: false,
        data: null,
      };
    }
  }
  async getChurch() {
    try {
      const data = await api.get("/api/church");
      return data.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return {
        error: error,
        success: false,
        data: null,
      };
    }
  }
}
