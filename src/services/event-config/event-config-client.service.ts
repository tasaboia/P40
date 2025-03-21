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
}
