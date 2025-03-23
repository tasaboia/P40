import api from "@p40/lib/axios";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { Shift } from "@p40/common/contracts/dashboard/dashboard";
import { prisma } from "@p40/app/api/prisma";

export class DashboardService {
  async getStats(churchId: string) {
    try {
      const totalLeaders = await prisma.user.count({
        where: {
          churchId,
        },
      });

      const totalEvents = await prisma.event.count({
        where: {
          churchId,
        },
      });

      const totalPrayerTurns = await prisma.prayerTurn.count({
        where: {
          event: {
            churchId,
          },
        },
      });

      const filledPrayerTurns = await prisma.prayerTurn.count({
        where: {
          event: {
            churchId,
          },
          userShifts: {
            some: {}, // Turnos com ao menos um líder
          },
        },
      });

      // Buscar todos os turnos e contar quantos têm menos que o máximo de participantes
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

      const partialPrayerTurns = allPrayerTurns.filter(
        (turn) =>
          turn.userShifts.length > 0 &&
          turn.userShifts.length < turn.event.maxParticipantsPerTurn
      ).length;

      const fullMaxParticipantsPerTurn = allPrayerTurns.filter(
        (turn) =>
          turn.event?.maxParticipantsPerTurn &&
          turn.userShifts.length === turn.event.maxParticipantsPerTurn
      ).length;

      const emptyPrayerTurns = totalPrayerTurns - filledPrayerTurns;

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
      return await prisma.prayerTurn.findMany({
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
      });
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
          // role: "LEADER", // Garantir que apenas líderes sejam retornados
        },
        include: {
          church: {
            include: {
              events: {
                select: {
                  id: true, // Include events' IDs for the church
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
      }));

      return leaders;
    } catch (error) {
      console.error("Erro ao buscar turnos vazios ou com 1 líder:", error);
      throw new Error("Erro ao buscar turnos vazios ou com 1 líder");
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
}

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
