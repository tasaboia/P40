export interface User {
  id: string;
  idProver: string;
  name: string;
  email: string;
  imageUrl: string;
  whatsapp: string;
  role: string;
  churchId: string;
  onboarding: boolean;
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

export interface UserResponse {
  success: boolean;
  user?: User | null;
  error?: string;
}

export interface UsersResponse {
  success: boolean;
  users?:
    | {
        id: string;
        name: string;
        email: string;
        whatsapp: string;
        churchId: string;
      }[]
    | null;
  error?: string;
}
