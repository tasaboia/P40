import React from "react";
import { auth } from "../../../../../auth";
import { ErrorHandler } from "@p40/components/custom/error-handler";
import WeekTab from "@p40/components/custom/week/week-tab";
import { getAllData } from "@p40/services/dashboard/dashboard-all";

export default async function SchedulePage() {
  const session = await auth();
  
  console.log("Session data:", {
    hasSession: !!session,
    userId: session?.user?.id,
    userRole: session?.user?.role,
    fullSession: session
  });

  if (!session?.user?.id) {
    return (
      <ErrorHandler
        error={{
          title: "Não autorizado",
          description: "Você precisa estar logado para acessar esta página",
        }}
      />
    );
  }

  if (session.user.role !== "LEADER" && session.user.role !== "ADMIN") {
    console.log("Acesso negado - Role atual:", session.user.role);
    return (
      <ErrorHandler
        error={{
          title: "Não autorizado",
          description: "Você precisa ser um líder ou administrador para acessar esta página",
        }}
      />
    );
  }

  const dashboardData = await getAllData(session.user.id);

  if (!dashboardData) {
    return (
      <ErrorHandler
        error={{
          title: "Erro ao buscar dados",
          description: "Tente novamente mais tarder",
        }}
      />
    );
  }

  const { event, prayerTurns, turns, user } = dashboardData.data;

  return (
    <div className="flex flex-col gap-4 bg-muted ">
      <WeekTab
        event={event}
        prayerTurns={prayerTurns}
        turns={turns}
        user={user}
      />
    </div>
  );
}
