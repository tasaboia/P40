export interface User {
  id: number;
  apiKey: string;
  login: string;
  nome: string;
  foto?: string;
  type: string;
  lider: boolean;
  admOracao: boolean;
  admEscala: boolean;
}

export interface AuthProverResponse {
  id: string;
  idProver: string;
  name: string;
  email: string;
  imageUrl: string;
  phone: string;
  role: string;
  churchId: string;
}
