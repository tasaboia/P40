// Tipos
export interface EventConfig {
  id: string;
  name: string;
  description: string;
  churchId: string;
  churchName: string;
  startDate: Date;
  endDate: Date;
  leadersPerShift: number;
  allowShiftChange: boolean;
  eventType: "shift" | "clock";
  shiftDuration: number;
}

export interface Church {
  id: string;
  name: string;
  location: string;
}

export interface PrayerTopic {
  id: string;
  day: number;
  title: string;
  description: string;
  imageUrl: string | null;
  date: Date;
}
