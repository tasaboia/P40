interface BaseApiResponse {
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
}

export interface SingleLeaderShiftResponse extends BaseApiResponse {
  data: Shift[];
}

export interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  leaders?: Leader[];
  weekday: number;
  status?: "empty" | "partial" | "full";
  type?: string;
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
  type: string;
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
  success: boolean;
  data: DashboadLeader[];
}
