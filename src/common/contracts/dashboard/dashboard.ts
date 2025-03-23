export interface BaseApiResponse {
  success?: boolean;
  error?: string;
}

export interface Dashboard extends BaseApiResponse {
  stats: {
    distinctLeaders: string;
    singleLeaderSlots: string;
    filledTimeSlots: string;
    emptyTimeSlots: string;
  };
}

export interface Stats {
  totalLeaders: number; // Total de líderes cadastrados
  totalEvents: number; // Total de eventos registrados
  totalPrayerTurns: number; // Total de turnos de oração
  filledPrayerTurns: number; // Total de turnos de oração preenchidos
  partialPrayerTurns: number; // Total de turnos de oração parcialmente preenchidos
  fullMaxParticipantsPerTurn: number; // Total de turnos de oração max de participantes preenchidos
  emptyPrayerTurns: number; // Total de turnos de oração vazios
  leadersPercentage: number; // Percentual de líderes por evento
  shiftsPercentage: number; // Percentual de turnos preenchidos
}
export interface DashboardStatsResponse extends BaseApiResponse {
  data?: Stats | null;
}

export interface Leader {
  id: string;
  name: string;
  imageUrl: string;
  email?: true;
  role?: true;
  whatsapp?: true;
}

export interface SingleLeaderShiftResponse extends BaseApiResponse {
  data: Shift[];
}

export interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  leaders?: Leader[];
  prayerTurn?: PrayerTurn;
  weekday: number;
  status?: "empty" | "partial" | "full";
  type?: string;
  church?: {
    name: string;
    id: string;
  };
}

export type ShiftWithoutStatusAndWeekday = Omit<Shift, "weekday" | "status">;

export interface ShiftResponse extends BaseApiResponse {
  data: Shift[];
}

export interface PrayerTurn {
  id: string;
  startTime: string;
  endTime: string;
  weekday: number;
  type?: string;
  eventId?: string;
}

export interface Church {
  id: string;
  name: string;
  events: { id: string }[];
}

export interface DashboadLeader {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  imageUrl: string;
  church: Church;
  userShifts: { prayerTurn: PrayerTurn }[];
}

export interface LeadersDashboardResponse extends BaseApiResponse {
  data: DashboadLeader[];
}

export interface Testimony {
  id: string;
  userId: string;
  churchId: string | null;
  date: Date;
  content: string;
  approved: boolean;
  type: TestimonyType | null;
  prayerTurnId: string;
  user: {
    id: string;
    name: string;
  };

  prayerTurn: PrayerTurn;
}
export interface TestimonyDashboardResponse extends BaseApiResponse {
  data: Testimony[];
}

export enum TestimonyType {
  HEALING = "HEALING",
  DELIVERANCE = "DELIVERANCE",
  TRANSFORMATION = "TRANSFORMATION",
  SALVATION = "SALVATION",
  BLESSING = "BLESSING",
  PROVISION = "PROVISION",
  MIRACLE = "MIRACLE",
  ENCOURAGEMENT = "ENCOURAGEMENT",
  FAITH = "FAITH",
  PEACE = "PEACE",
}
