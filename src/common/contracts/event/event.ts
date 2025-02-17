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
