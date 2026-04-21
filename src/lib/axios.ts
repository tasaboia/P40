import axios from "axios";
import { getSession } from "next-auth/react";

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

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const url = config.url ?? "";

    const isPublicRequest =
      url.includes("/api/church/list") ||
      url.includes("/api/auth/session");

    if (!isPublicRequest) {
      try {
        const session = await getSession();
        if (session?.user?.id) {
          config.headers.Authorization = `Bearer ${session.user.id}`;
        }
      } catch {
        // sem sessão, segue sem Authorization
      }
    }
  }

  return config;
});

export default api;
