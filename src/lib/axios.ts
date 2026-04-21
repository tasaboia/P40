import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: 'https://40dias.zionchurch.org.br',
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      const session = await getSession();
      if (session?.user?.id) {
        config.headers.Authorization = `Bearer ${session.user.id}`;
      }
    } catch {
      // sem sessão = sem header, tudo bem
    }
  }
  return config;
});

export default api;
