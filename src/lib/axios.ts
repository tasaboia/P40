import Log from "@p40/services/logging";
import axios from "axios";
import { getSession } from "next-auth/react";

// In the browser use a relative base URL so requests always go to the same
// origin as the page, avoiding cross-origin CORS errors when a custom domain
// is configured. On the server, fall back to NEXT_PUBLIC_API_BASE_URL.
const baseURL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Adiciona token de autenticação em todas as requisições do lado do cliente
api.interceptors.request.use(async (config) => {
  // Verifica se está no cliente (browser)
  if (typeof window !== 'undefined') {
    try {
      const session = await getSession();
      if (session?.user) {
        config.headers.Authorization = `Bearer ${session.user.id}`;
      }
    } catch (error) {
      console.error("Erro ao obter sessão:", error);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    Log(error);
    return Promise.reject(error);
  }
);

export default api;
