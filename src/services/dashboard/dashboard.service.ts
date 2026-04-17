import api from "@p40/lib/axios";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { prisma } from "@p40/app/api/prisma";

export class DashboardService {
  private buildDailySlots(shiftDuration: number) {
    const safeDuration = shiftDuration && shiftDuration > 0 ? shiftDuration : 60;
    const slotsPerDay = Math.floor((24 * 60) / safeDuration);

    return Array.from({ length: slotsPerDay }, (_, index) => {
      const startMinutes = index * safeDuration;
      const endMinutes = startMinutes + safeDuration;

      const startHour = Math.floor(startMinutes / 60) % 24;
      const startMinute = startMinutes % 60;
      const endHour = Math.floor(endMinutes / 60) % 24;
      const endMinute = endMinutes % 60;

      return {
        startTime: `${startHour.toString().padStart(2, "0")}:${startMinute
          .toString()
          .padStart(2, "0")}`,
        endTime: `${endHour.toString().padStart(2, "0")}:${endMinute
          .toString()
          .padStart(2, "0")}`,
      };
    });
  }

  async getStats(churchId: string) {
    try {
      const totalLeaders = await prisma.user.count({
        where: {
          churchId,
        },
      });

      const events = await prisma.event.findMany({
        where: {
          churchId,
        },
        select: {
          id: true,
          shiftDuration: true,
          maxParticipantsPerTurn: true,
        },
      });
      const totalEvents = events.length;

      // Buscar turnos já existentes
      const allPrayerTurns = await prisma.prayerTurn.findMany({
        where: {
          event: {
            churchId,
          },
        },
        include: {
          userShifts: true, // Inclui os líderes associados ao turno
          event: {
            // Inclui o evento para acessar maxParticipantsPerTurn
            select: {
              maxParticipantsPerTurn: true, // Inclui a quantidade máxima de participantes por turno
            },
          },
        },
      });

      const eventById = new Map(events.map((event) => [event.id, event]));
      const existingTurnByKey = new Map(
        allPrayerTurns.map((turn) => [
          `${turn.eventId}-${turn.weekday}-${turn.startTime}`,
          turn,
        ])
      );

      let totalPrayerTurns = 0;
      let filledPrayerTurns = 0;
      let partialPrayerTurns = 0;
      let fullMaxParticipantsPerTurn = 0;
      let emptyPrayerTurns = 0;

      for (const event of events) {
        const daySlots = this.buildDailySlots(event.shiftDuration || 60);
        const maxParticipants = event.maxParticipantsPerTurn ?? 1;

        for (let weekday = 0; weekday <= 6; weekday++) {
          for (const slot of daySlots) {
            totalPrayerTurns++;
            const key = `${event.id}-${weekday}-${slot.startTime}`;
            const existingTurn = existingTurnByKey.get(key);
            const participants = existingTurn?.userShifts?.length || 0;

            if (participants === 0) {
              emptyPrayerTurns++;
              continue;
            }

            filledPrayerTurns++;

            if (participants >= maxParticipants) {
              fullMaxParticipantsPerTurn++;
            } else {
              partialPrayerTurns++;
            }
          }
        }
      }

      const leadersPercentage =
        totalEvents > 0 ? (totalLeaders / totalEvents) * 100 : 0;

      const shiftsPercentage =
        totalPrayerTurns > 0 ? (filledPrayerTurns / totalPrayerTurns) * 100 : 0;

      return {
        totalLeaders,
        totalEvents,
        totalPrayerTurns,
        filledPrayerTurns,
        partialPrayerTurns,
        fullMaxParticipantsPerTurn,
        emptyPrayerTurns,
        leadersPercentage,
        shiftsPercentage,
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas do dashboard:", error);
      throw new Error("Erro ao buscar estatísticas do dashboard");
    }
  }

  async getEventStats(churchId: string) {
    try {
      const events = await prisma.event.findMany({
        where: {
          churchId,
        },
        include: {
          _count: {
            select: {
              prayerTurns: true,
            },
          },
          prayerTurns: {
            include: {
              userShifts: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return events.map((event) => {
        // Total de turnos para este evento
        const totalTurns = event._count.prayerTurns;

        // Turnos com líder
        const filledTurns = event.prayerTurns.filter(
          (turn) => turn.userShifts.length > 0
        ).length;

        // Turnos sem líder
        const emptyTurns = totalTurns - filledTurns;

        // Taxa de preenchimento
        const fillRate = totalTurns > 0 ? (filledTurns / totalTurns) * 100 : 0;

        // Líderes distintos
        const distinctLeaders = new Set(
          event.prayerTurns.flatMap((turn) =>
            turn.userShifts.map((shift) => shift.userId)
          )
        ).size;

        return {
          id: event.id,
          name: event.name,
          totalTurns,
          filledTurns,
          emptyTurns,
          fillRate,
          distinctLeaders,
          startDate: event.startDate,
          endDate: event.endDate,
        };
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas de eventos:", error);
      throw new Error("Erro ao buscar estatísticas de eventos");
    }
  }

  async getWeekdayDistribution(churchId: string) {
    try {
      const weekdays = [0, 1, 2, 3, 4, 5, 6];

      const turns = await prisma.prayerTurn.findMany({
        where: {
          event: {
            churchId,
          },
        },
        include: {
          userShifts: true,
        },
      });

      // Inicializa contadores para cada dia da semana
      const distribution = weekdays.map((day) => ({
        day,
        total: 0,
        filled: 0,
        empty: 0,
      }));

      // Conta os turnos por dia da semana
      turns.forEach((turn) => {
        const dayIndex = turn.weekday;
        if (dayIndex >= 0 && dayIndex <= 6) {
          distribution[dayIndex].total++;

          if (turn.userShifts.length > 0) {
            distribution[dayIndex].filled++;
          } else {
            distribution[dayIndex].empty++;
          }
        }
      });

      return distribution;
    } catch (error) {
      console.error("Erro ao buscar distribuição por dia da semana:", error);
      throw new Error("Erro ao buscar distribuição por dia da semana");
    }
  }

  async getSingleLeaderAndEmptyShifts(churchId: string) {
    try {
      const allPrayerTurns = await prisma.prayerTurn.findMany({
        where: {
          event: {
            churchId,
          },
        },
        include: {
          userShifts: {
            include: {
              prayerTurn: true,
              user: {
                select: {
                  church: true,
                  id: true,
                  name: true,
                  imageUrl: true,
                  email: true,
                  role: true,
                  whatsapp: true,
                },
              },
            },
          },
        },
      });

      const singleLeaderShifts = allPrayerTurns.filter(
        (turn) => turn.userShifts.length === 1
      );

      const result = singleLeaderShifts.map((turn) => {
        return {
          id: turn.id,
          startTime: turn.startTime,
          weekday: turn.weekday,
          endTime: turn.endTime,
          leaders: [turn.userShifts[0].user],
          prayerTurn: turn,
          church: {
            name: turn.userShifts[0].user.church.name,
            id: turn.userShifts[0].user.church.id,
          },
        };
      });

      return result;
    } catch (error) {
      console.error("Erro ao buscar turnos vazios ou com 1 líder:", error);
      throw new Error("Erro ao buscar turnos vazios ou com 1 líder");
    }
  }

  async getEventTurns(churchId: string, limit: number = 10) {
    try {
      const [events, existingTurns] = await Promise.all([
        prisma.event.findMany({
          where: {
            churchId,
          },
          select: {
            id: true,
            shiftDuration: true,
            maxParticipantsPerTurn: true,
          },
        }),
        prisma.prayerTurn.findMany({
          where: {
            event: {
              churchId,
            },
          },
          include: {
            userShifts: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      const existingTurnByKey = new Map(
        existingTurns.map((turn) => [
          `${turn.eventId}-${turn.weekday}-${turn.startTime}`,
          turn,
        ])
      );

      const allSlots = [];

      for (const event of events) {
        const daySlots = this.buildDailySlots(event.shiftDuration || 60);
        const maxParticipants = event.maxParticipantsPerTurn ?? 1;

        for (let weekday = 0; weekday <= 6; weekday++) {
          for (const slot of daySlots) {
            const key = `${event.id}-${weekday}-${slot.startTime}`;
            const existingTurn = existingTurnByKey.get(key);
            const leaders =
              existingTurn?.userShifts?.map((shift) => shift.user) || [];
            const participants = leaders.length;

            const status =
              participants === 0
                ? "empty"
                : participants >= maxParticipants
                ? "full"
                : "partial";

            allSlots.push({
              id: existingTurn?.id || `${event.id}-${weekday}-${slot.startTime}`,
              eventId: event.id,
              weekday,
              startTime: slot.startTime,
              endTime: slot.endTime,
              userShifts: leaders.map((user) => ({ user })),
              status,
            });
          }
        }
      }

      return allSlots;
    } catch (error) {
      console.error("Erro ao buscar turnos vazios ou com 1 líder:", error);
      throw new Error("Erro ao buscar turnos vazios ou com 1 líder");
    }
  }

  async getLeaders(churchId: string) {
    try {
      const allLeaders = await prisma.user.findMany({
        where: {
          churchId: churchId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          role: true,
          whatsapp: true,
          church: {
            include: {
              events: {
                select: {
                  id: true,
                },
              },
            },
          },
          userShifts: {
            include: {
              prayerTurn: {
                select: {
                  endTime: true,
                  startTime: true,
                  weekday: true,
                  type: true,
                  id: true,
                },
              },
            },
          },
          serviceAreas: {
            include: {
              serviceArea: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const leaders = allLeaders.map((leader) => ({
        id: leader.id,
        name: leader.name,
        email: leader.email,
        whatsapp: leader.whatsapp || "",
        imageUrl: leader.imageUrl,
        church: {
          id: leader.church.id,
          name: leader.church.name,
          events: leader.church.events.map((event) => ({
            id: event.id,
          })),
        },
        userShifts: leader.userShifts.map((shift) => ({
          prayerTurn: {
            id: shift.prayerTurn.id,
            startTime: shift.prayerTurn.startTime,
            endTime: shift.prayerTurn.endTime,
            weekday: shift.prayerTurn.weekday,
            type: shift.prayerTurn.type,
          },
        })),
        serviceAreas: leader.serviceAreas.map((sa) => ({
          id: sa.id,
          serviceArea: {
            id: sa.serviceArea.id,
            name: sa.serviceArea.name,
          },
        })),
      }));

      return leaders;
    } catch (error) {
      console.error("Erro ao buscar líderes:", error);
      throw new Error("Erro ao buscar líderes");
    }
  }

  async getTestemuny(churchId: string) {
    try {
      const testimonies = await prisma.testimony.findMany({
        where: {
          churchId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          prayerTurn: {
            select: {
              startTime: true,
              endTime: true,
              id: true,
              eventId: true,
            },
          },
        },
      });
      return testimonies;
    } catch (error) {
      console.error("Erro ao buscar turnos vazios ou com 1 líder:", error);
      throw new Error("Erro ao buscar turnos vazios ou com 1 líder");
    }
  }

  async addLeaderToShift(leaderId: string, shiftId: string) {
    try {
      const existing = await prisma.userShift.findFirst({
        where: {
          userId: leaderId,
          prayerTurnId: shiftId,
        },
      });

      const newUserShift = await prisma.userShift.create({
        data: {
          userId: leaderId,
          prayerTurnId: shiftId,
        },
      });

      return { success: true, data: newUserShift };
    } catch (error) {
      console.error("Erro ao adicionar líder ao turno:", error);
      return { success: false, error: error.message };
    }
  }

  async getAllServiceAreas() {
    try {
      const response = await api.get('/api/service-areas');
      return response.data.data;
    } catch (error) {
      console.error("Erro ao buscar áreas de serviço:", error);
      throw new Error("Erro ao buscar áreas de serviço");
    }
  }
}

//remover e reorganizar chamadas dashboard
export async function dashboardData(eventId: string): Promise<{
  success: boolean;
  stats: {
    distinctLeaders: string;
    singleLeaderSlots: string;
    filledTimeSlots: string;
    emptyTimeSlots: string;
  };
}> {
  try {
    const response = await api.get(`/api/dashboard?eventId=${eventId}`);

    return response.data;
  } catch (error) {
    throw new FailException({
      message: error.response?.data?.message || "Erro buscar dashboard.",
      statusCode: error.response?.status || 500,
    });
  }
}
