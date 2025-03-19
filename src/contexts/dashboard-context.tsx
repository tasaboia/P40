"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { eventByChurchId } from "@p40/services/event/event-byId";
import { getPrayerTurns } from "@p40/services/event/prayer-turn/get-prayer-turns";
import { getTurns } from "@p40/services/event/get-turn";
import { User } from "@p40/common/contracts/user/user";
import { EventResponse } from "@p40/common/contracts/event/event";
import { dashboardData } from "@p40/services/dashboard/dashboard.service";
import { getChartEventData } from "@p40/services/event/chart-event-data";
import { getUserByChurchId } from "@p40/services/user/user-service";
import { ErrorHandler } from "@p40/components/custom/error-handler";
import { useSession } from "next-auth/react";
import { eventByUserEmail } from "@p40/services/event/event-by-email";

interface DashboardContextData {
  user: User | null;
  event: EventResponse | null;
  prayerTurns: any;
  turns: any;
  stats: {
    distinctLeaders: string;
    singleLeaderSlots: string;
    filledTimeSlots: string;
    emptyTimeSlots: string;
  };
  chartData: any;
  users: any[];
  isLoading: boolean;
  error: Error | null;
}

const DashboardContext = createContext<DashboardContextData>(
  {} as DashboardContextData
);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const { data: session, status } = useSession();
  const [currentError, setCurrentError] = useState<Error | null>(null);

  // Verificar a sessão diretamente
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session) {
      setCurrentError(new Error("Usuário não autenticado"));
    } else if (!session.user?.email) {
      setCurrentError(new Error("Email do usuário não encontrado na sessão"));
    }
  }, [session, status]);

  // Criar um objeto de usuário diretamente da sessão (sem chamada ao servidor)
  const user: User | null = session?.user
    ? {
        id: session.user.id || "session-user-id",
        name: session.user.name || "Usuário",
        email: session.user.email || "",
        churchId: session.user.churchId || "",
        whatsapp: session.user.whatsapp || "",
        imageUrl: session.user.image || "",
        role: "user",
        idProver: "next-auth",
        onboarding: true,
      }
    : null;

  // Carregar evento com base no email do usuário (sem depender do churchId)
  const {
    data: eventData,
    isLoading: isLoadingEvent,
    error: eventError,
  } = useQuery({
    queryKey: ["event", session?.user?.email],
    queryFn: async () => {
      try {
        if (!session?.user?.email) {
          throw new Error("Email do usuário não encontrado na sessão");
        }

        console.log("Buscando evento para o usuário:", session.user.email);
        // Aqui você precisa criar o serviço eventByUserEmail ou adaptar o serviço existente
        const event = await eventByUserEmail(session.user.email);

        if (!event?.id) {
          console.error("Erro ao buscar evento:", event);
          throw new Error("Não foi possível carregar os dados do evento");
        }

        return event;
      } catch (error) {
        console.error("Erro ao buscar evento:", error);
        throw new Error("Não foi possível carregar os dados do evento");
      }
    },
    enabled: !!session?.user?.email && status === "authenticated",
  });

  const { data: prayerTurnsData, isLoading: isLoadingPrayerTurns } = useQuery({
    queryKey: ["prayerTurns", eventData?.id],
    queryFn: async () => {
      try {
        if (!eventData?.id) return [];
        const response = await getPrayerTurns(eventData.id);
        return response.prayerTurn || [];
      } catch (error) {
        console.error("Erro ao buscar turnos de oração:", error);
        return [];
      }
    },
    enabled: !!eventData?.id,
  });

  const { data: turnsData, isLoading: isLoadingTurns } = useQuery({
    queryKey: ["turns", eventData?.id],
    queryFn: async () => {
      try {
        if (!eventData?.id) return [];
        const turns = await getTurns({ eventId: eventData.id });
        return turns;
      } catch (error) {
        console.error("Erro ao buscar turnos:", error);
        return [];
      }
    },
    enabled: !!eventData?.id,
  });

  const {
    data: dashboardStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboard", eventData?.id],
    queryFn: async () => {
      try {
        if (!eventData?.id) {
          throw new Error("ID do evento não encontrado");
        }
        console.log("Buscando estatísticas com eventId:", eventData.id);
        const response = await dashboardData(eventData.id);

        if (!response?.success) {
          console.error("Erro ao buscar estatísticas:", response);
          throw new Error(
            "Não foi possível carregar as estatísticas do dashboard"
          );
        }
        return response;
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        throw new Error(
          "Não foi possível carregar as estatísticas do dashboard"
        );
      }
    },
    enabled: !!eventData?.id,
  });

  const {
    data: chartData,
    isLoading: isLoadingChart,
    error: chartError,
  } = useQuery({
    queryKey: ["chart", eventData?.id],
    queryFn: async () => {
      try {
        if (!eventData?.id) {
          throw new Error("ID do evento não encontrado");
        }
        console.log("Buscando dados do gráfico com eventId:", eventData.id);
        const response = await getChartEventData(eventData.id);

        if (!response?.success) {
          console.error("Erro ao buscar dados do gráfico:", response);
          throw new Error("Não foi possível carregar os dados do gráfico");
        }
        return response;
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error);
        throw new Error("Não foi possível carregar os dados do gráfico");
      }
    },
    enabled: !!eventData?.id,
  });

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users", eventData?.id],
    queryFn: async () => {
      try {
        if (!eventData?.churchId) {
          throw new Error("ID da igreja não encontrado no evento");
        }
        console.log("Buscando usuários com churchId:", eventData.churchId);
        const response = await getUserByChurchId(eventData.churchId);

        if (!response?.success) {
          console.error("Erro ao buscar usuários:", response);
          throw new Error("Não foi possível carregar os usuários");
        }
        return response;
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        throw new Error("Não foi possível carregar os usuários");
      }
    },
    enabled: !!eventData?.id,
  });

  // Detectar e consolidar erros
  useEffect(() => {
    if (eventError) {
      setCurrentError(
        eventError instanceof Error
          ? eventError
          : new Error("Erro ao carregar evento")
      );
    } else if (statsError) {
      setCurrentError(
        statsError instanceof Error
          ? statsError
          : new Error("Erro ao carregar estatísticas")
      );
    } else if (chartError) {
      setCurrentError(
        chartError instanceof Error
          ? chartError
          : new Error("Erro ao carregar gráfico")
      );
    } else if (usersError) {
      setCurrentError(
        usersError instanceof Error
          ? usersError
          : new Error("Erro ao carregar usuários")
      );
    } else if (status === "unauthenticated") {
      setCurrentError(new Error("Usuário não autenticado"));
    } else {
      setCurrentError(null);
    }
  }, [eventError, statsError, chartError, usersError, status]);

  const isLoading =
    status === "loading" ||
    isLoadingEvent ||
    isLoadingPrayerTurns ||
    isLoadingTurns ||
    isLoadingStats ||
    isLoadingChart ||
    isLoadingUsers;

  const value = {
    user,
    event: eventData || null,
    prayerTurns: prayerTurnsData || [],
    turns: turnsData || [],
    stats: {
      distinctLeaders: dashboardStats?.stats?.distinctLeaders || "0",
      singleLeaderSlots: dashboardStats?.stats?.singleLeaderSlots || "0",
      filledTimeSlots: dashboardStats?.stats?.filledTimeSlots || "0",
      emptyTimeSlots: dashboardStats?.stats?.emptyTimeSlots || "0",
    },
    chartData: chartData?.data || [],
    users: usersData?.users || [],
    isLoading: isLoading && !currentError, // Não mostrar loading se tiver erro
    error: currentError,
  };

  // Se estiver com erro e não estiver carregando, mostrar uma mensagem amigável
  if (currentError && !isLoading) {
    console.error("DashboardProvider - Erro:", currentError);
    return (
      <ErrorHandler
        error={{
          title: "Erro ao carregar dashboard",
          description: currentError.message,
        }}
      />
    );
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboard deve ser usado dentro de um DashboardProvider"
    );
  }
  return context;
}
