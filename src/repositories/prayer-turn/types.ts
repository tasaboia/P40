import { PrayerTurn } from "@prisma/client";
import {
  CreatePrayerTurnDTO,
  RemovePrayerTurnDTO,
  PrayerTurnWithRelations,
} from "@p40/common/contracts/prayer-turn/types";

export interface IPrayerTurnRepository {
  // Operações básicas
  create(data: CreatePrayerTurnDTO): Promise<PrayerTurnWithRelations>;
  findById(id: string): Promise<PrayerTurnWithRelations | null>;
  findByEventId(eventId: string): Promise<PrayerTurnWithRelations[]>;
  findByWeekday(
    eventId: string,
    weekday: number
  ): Promise<PrayerTurnWithRelations[]>;
  update(
    id: string,
    data: Partial<PrayerTurn>
  ): Promise<PrayerTurnWithRelations>;
  remove(data: RemovePrayerTurnDTO): Promise<void>;

  // Operações específicas
  findLeaderTurns(leaderId: string): Promise<PrayerTurnWithRelations[]>;
  findOverlappingTurns(
    eventId: string,
    weekday: number,
    startTime: string
  ): Promise<PrayerTurnWithRelations[]>;

  // Operações de estatísticas
  getEventStats(eventId: string): Promise<{
    distinctLeaders: number;
    singleLeaderSlots: number;
    filledTimeSlots: number;
    emptyTimeSlots: number;
    expectedSlotsWeek: number;
    filledSlotsByWeekday: number[];
    emptySlotsByWeekday: number[];
  }>;
}
