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
