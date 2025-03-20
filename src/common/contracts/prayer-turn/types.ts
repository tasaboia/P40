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

export interface CreatePrayerTurnDTO {
  userId: string;
  eventId: string;
  startTime: string;
  weekday: number;
}

export interface RemovePrayerTurnDTO {
  userId: string;
  prayerTurnId: string;
}

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
