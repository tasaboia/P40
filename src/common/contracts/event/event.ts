export interface EventResponse {
  id: string;
  churchId: string;
  name: string;
  startDate: string;
  type: "SHIFT" | "CLOCK";
  endDate: string;
  description: string;
  maxParticipantsPerTurn: number;
  shiftDuration: number;
  createdAt: string;
  updatedAt: string;
  church: { name: string; city: string; country: string };
}

export interface ChartEventDayData {
  day: number;
  people: number;
  emptySlots: number;
}

export interface ChartEventResponse {
  success: boolean;
  data: ChartEventDayData[];
}
