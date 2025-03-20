import { PrayerTurn, PrismaClient } from "@prisma/client";
import { IPrayerTurnRepository } from "./types";
import {
  CreatePrayerTurnDTO,
  RemovePrayerTurnDTO,
  PrayerTurnWithRelations,
} from "@p40/common/contracts/prayer-turn/types";

export class PrismaPrayerTurnRepository implements IPrayerTurnRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreatePrayerTurnDTO): Promise<PrayerTurnWithRelations> {
    return this.prisma.prayerTurn.create({
      data: {
        type: "SHIFT",
        startTime: data.startTime,
        endTime: data.startTime, // Será atualizado com base na duração do evento
        duration: 60, // Valor padrão, será atualizado com base no evento
        weekday: data.weekday,
        event: { connect: { id: data.eventId } },
        userShifts: {
          create: {
            userId: data.userId,
          },
        },
      },
      include: {
        userShifts: {
          include: {
            user: true,
          },
        },
        event: true,
      },
    }) as Promise<PrayerTurnWithRelations>;
  }

  async findById(id: string): Promise<PrayerTurnWithRelations | null> {
    return this.prisma.prayerTurn.findUnique({
      where: { id },
      include: {
        userShifts: {
          include: {
            user: true,
          },
        },
        event: true,
      },
    }) as Promise<PrayerTurnWithRelations | null>;
  }

  async findByEventId(eventId: string): Promise<PrayerTurnWithRelations[]> {
    return this.prisma.prayerTurn.findMany({
      where: { eventId },
      include: {
        userShifts: {
          include: {
            user: true,
          },
        },
        event: true,
      },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    }) as Promise<PrayerTurnWithRelations[]>;
  }

  async findByWeekday(
    eventId: string,
    weekday: number
  ): Promise<PrayerTurnWithRelations[]> {
    return this.prisma.prayerTurn.findMany({
      where: {
        eventId,
        weekday,
      },
      include: {
        userShifts: {
          include: {
            user: true,
          },
        },
        event: true,
      },
      orderBy: { startTime: "asc" },
    }) as Promise<PrayerTurnWithRelations[]>;
  }

  async update(
    id: string,
    data: Partial<PrayerTurn>
  ): Promise<PrayerTurnWithRelations> {
    return this.prisma.prayerTurn.update({
      where: { id },
      data,
      include: {
        userShifts: {
          include: {
            user: true,
          },
        },
        event: true,
      },
    }) as Promise<PrayerTurnWithRelations>;
  }

  async remove(data: RemovePrayerTurnDTO): Promise<void> {
    await this.prisma.userShift.deleteMany({
      where: {
        prayerTurnId: data.prayerTurnId,
        userId: data.userId,
      },
    });
  }

  async findLeaderTurns(leaderId: string): Promise<PrayerTurnWithRelations[]> {
    return this.prisma.prayerTurn.findMany({
      where: {
        userShifts: {
          some: {
            userId: leaderId,
          },
        },
      },
      include: {
        userShifts: {
          include: {
            user: true,
          },
        },
        event: true,
      },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    }) as Promise<PrayerTurnWithRelations[]>;
  }

  async findOverlappingTurns(
    eventId: string,
    weekday: number,
    startTime: string
  ): Promise<PrayerTurnWithRelations[]> {
    return this.prisma.prayerTurn.findMany({
      where: {
        eventId,
        weekday,
        startTime,
      },
      include: {
        userShifts: {
          include: {
            user: true,
          },
        },
        event: true,
      },
    }) as Promise<PrayerTurnWithRelations[]>;
  }

  async getEventStats(eventId: string): Promise<{
    distinctLeaders: number;
    singleLeaderSlots: number;
    filledTimeSlots: number;
    emptyTimeSlots: number;
    expectedSlotsWeek: number;
    filledSlotsByWeekday: number[];
    emptySlotsByWeekday: number[];
  }> {
    const turns = (await this.prisma.prayerTurn.findMany({
      where: { eventId },
      include: {
        userShifts: {
          include: {
            user: true,
          },
        },
        event: true,
      },
    })) as PrayerTurnWithRelations[];

    const distinctLeaders = new Set(
      turns.flatMap((turn) => turn.userShifts.map((shift) => shift.userId))
    ).size;
    const singleLeaderSlots = turns.filter(
      (turn) => turn.userShifts.length === 1
    ).length;
    const filledTimeSlots = turns.filter(
      (turn) => turn.userShifts.length > 0
    ).length;
    const emptyTimeSlots = turns.filter(
      (turn) => turn.userShifts.length === 0
    ).length;
    const expectedSlotsWeek = filledTimeSlots + emptyTimeSlots;

    const filledSlotsByWeekday = Array(7).fill(0);
    const emptySlotsByWeekday = Array(7).fill(0);

    turns.forEach((turn) => {
      if (turn.weekday !== null) {
        if (turn.userShifts.length > 0) {
          filledSlotsByWeekday[turn.weekday]++;
        } else {
          emptySlotsByWeekday[turn.weekday]++;
        }
      }
    });

    return {
      distinctLeaders,
      singleLeaderSlots,
      filledTimeSlots,
      emptyTimeSlots,
      expectedSlotsWeek,
      filledSlotsByWeekday,
      emptySlotsByWeekday,
    };
  }
}
