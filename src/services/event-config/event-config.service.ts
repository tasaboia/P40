import { prisma } from "@p40/lib/prisma";

export class EventConfigService {
  async getEventConfig(churchId: string) {
    try {
      const event = await prisma.event.findFirst({
        where: {
          churchId: churchId,
        },
        include: {
          church: {
            select: {
              name: true,
              city: true,
              country: true,
            },
          },
        },
      });

      if (event) {
        return {
          id: event.id,
          name: event.name,
          description: event.description || "Sem descrição",
          churchId: event.churchId,
          churchName: event.church.name,
          startDate: event.startDate,
          endDate: event.endDate,
          leadersPerShift: event.maxParticipantsPerTurn || 2,
          allowShiftChange: true, // PRECISA ALTERAR ESSE ITEM
          eventType: event.type,
          shiftDuration: event.shiftDuration || 60,
        };
      } else {
        throw new Error("Evento não encontrado para a igreja especificada.");
      }
    } catch (error) {
      console.error("Erro ao buscar evento:", error);
      throw new Error("Erro ao buscar evento");
    }
  }
  async updateEventConfig(churchId: string) {
    try {
    } catch (error) {
      console.error("Erro ao buscar estatísticas do dashboard:", error);
      throw new Error("Erro ao buscar estatísticas do dashboard");
    }
  }
}

// const [eventConfig, setEventConfig] = useState<EventConfig>({
//     id: "1",
//     name: "40 Dias de Oração",
//     description: "Evento de oração contínua durante 40 dias",
//     churchId: "1",
//     churchName: "Igreja Zion Central",
//     startDate: new Date(2024, 3, 1, 0, 0, 0), // 1 de abril de 2024
//     endDate: new Date(2024, 4, 10, 23, 59, 59), // 10 de maio de 2024
//     leadersPerShift: 2,
//     allowShiftChange: true,
//     eventType: "shift",
//     shiftDuration: 60,
//   });
