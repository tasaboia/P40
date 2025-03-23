import { DailyPrayerTopicResponse } from "@p40/common/contracts/daily-topics/daily-topics";
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
  async getChurch(churchId: string) {
    try {
      const data = await api.get(`/api/church?churchId=${churchId}`);
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
  async getDailyTopics(eventId: string): Promise<DailyPrayerTopicResponse> {
    try {
      const data = await api.get(`/api/upload?eventId=${eventId}`);
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

  async removeDailyTopic(topicId: string) {
    try {
      const data = await api.delete(`/api/upload/${topicId}`);
      return data.data;
    } catch (error) {
      console.error("Erro ao remover o tópico:", error);
      return {
        error: error,
        success: false,
        data: null,
      };
    }
  }
  async uploadDailyTopicImage({
    id,
    eventId,
    description,
    date,
    imageUrl,
  }: {
    id: string;
    eventId: string;
    description: string;
    date: string;
    imageUrl: string;
  }) {
    try {
      const data = await api.put(`/api/upload`, {
        id,
        eventId,
        description,
        date,
        imageUrl,
      });
      return data.data;
    } catch (error) {
      console.error("Erro ao atualizar imagem do tópico:", error);
      return {
        error: error,
        success: false,
        data: null,
      };
    }
  }
}
