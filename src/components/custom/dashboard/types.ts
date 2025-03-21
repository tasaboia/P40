// Tipos compartilhados para os componentes do dashboard

export interface Leader {
  id: string;
  name: string;
  email: string;
  phone: string;
  church: string;
  shifts: Shift[];
  registeredAt: Date;
}

export interface Shift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  leaders: Leader[];
  status: "empty" | "partial" | "full";
}

export interface Church {
  id: string;
  name: string;
  location: string;
}

export interface Testimony {
  id: string;
  leaderId: string;
  leaderName: string;
  date: Date;
  content: string;
  approved: boolean;
}

export interface ShiftReport {
  id: string;
  shiftId: string;
  date: Date;
  leaderId: string;
  leaderName: string;
  attendees: number;
  notes: string;
}

export interface FilterOptions {
  searchTerm: string;
  churchFilter: string;
  dateFilter: string;
  statusFilter: string;
}
