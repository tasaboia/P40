export interface Church {
  id: string;
  name: string;
  address: string | null;
  city: string;
  country: string;
  regionId: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  events: Event[];
}

export interface Event {
  id: string;
  churchId: string;
  name: string;
  startDate: string;
  type: "SHIFT" | "CLOCK";
  endDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  prayerTurns: PrayerTurn[];
  prayerTopics: PrayerTopic[];
}

export interface PrayerTurn {
  id: string;
  eventId: string;
  type: "SHIFT" | "CLOCK";
  startTime: string;
  endTime: string;
  duration: number;
  weekday: number;
  maxParticipants: number;
  createdAt: string;
  updatedAt: string;
  userShifts: UserShift[];
}

export interface UserShift {
  id: string;
  userId: string;
  prayerTurnId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerTopic {
  id: string;
  eventId: string;
  date: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
