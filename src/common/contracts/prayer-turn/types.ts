import { z } from "zod";
import {
  CreatePrayerTurnDTOSchema,
  RemovePrayerTurnDTOSchema,
} from "./validation";

export interface Leader {
  id: string;
  name: string;
  whatsapp: string;
  imageUrl: string;
  email: string;
  churchId: string;
}

export interface PrayerTurn {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  allowChangeAfterStart: boolean;
  weekday: number;
  leaders: Leader[];
}

export interface PrayerTurnResponse extends PrayerTurn {}

export type CreatePrayerTurnDTO = z.infer<typeof CreatePrayerTurnDTOSchema>;
export type RemovePrayerTurnDTO = z.infer<typeof RemovePrayerTurnDTOSchema>;

export interface PrayerTurnStats {
  distinctLeaders: number;
  singleLeaderSlots: number;
  filledTimeSlots: number;
  emptyTimeSlots: number;
  expectedSlotsWeek: number;
  filledSlotsByWeekday: number[];
  emptySlotsByWeekday: number[];
}

export interface ChartData {
  day: number;
  people: number;
  emptySlots: number;
}

export interface PrayerTurnWithRelations {
  id: string;
  eventId: string;
  type: "SHIFT" | "CLOCK";
  startTime: string;
  endTime: string;
  duration: number;
  weekday: number | null;
  allowChangeAfterStart: boolean;
  createdAt: Date;
  updatedAt: Date;
  userShifts: Array<{
    id: string;
    userId: string;
    prayerTurnId: string;
    user: {
      id: string;
      name: string;
      whatsapp: string | null;
      email: string;
      imageUrl: string | null;
    };
  }>;
  event: {
    id: string;
    name: string;
    churchId: string;
  };
}
