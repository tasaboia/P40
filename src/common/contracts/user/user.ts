export interface User {
  id: string;
  idProver: string;
  name: string;
  email: string;
  imageUrl: string;
  phone: string;
  role: string;
  churchId: string;
}

export interface TurnLeader {
  id: string;
  name: string;
  whatsapp: string;
  imageUrl: string;
}

export interface PrayerTurnResponse {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  allowChangeAfterStart: boolean;
  leaders: TurnLeader[];
}
