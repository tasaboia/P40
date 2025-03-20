import React, { Suspense } from "react";
import Loading from "../loading";
import { ErrorHandler } from "@p40/components/custom/error-handler";
import { auth } from "../../../../../auth";
import { getAllData } from "@p40/services/dashboard/dashboard-all";
import ConfigEventOnboarding from "@p40/components/custom/config-event/onboarding";
import { DashboardTabs } from "@p40/components/custom/dashboard/dashboard-tabs";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return (
      <ErrorHandler
        error={{
          title: "Não autorizado",
          description: "Você precisa estar logado para acessar esta página",
        }}
      />
    );
  }

  const dashboardData = await getAllData(session.user.id);

  if (!dashboardData.success || !dashboardData.data) {
    return (
      <ErrorHandler
        error={{
          title: "Erro ao carregar dashboard",
          description:
            dashboardData.error ||
            "Não foi possível carregar os dados do dashboard",
        }}
      />
    );
  }

  const { user, event, prayerTurns, turns, stats, chartData, users } =
    dashboardData.data;

  return (
    <Suspense fallback={<Loading />}>
      {(!event || (Array.isArray(event) && event.length === 0)) && (
        <ConfigEventOnboarding user={user} church={user?.churchId} />
      )}

      {event && !Array.isArray(event) && (
        <DashboardTabs
          user={user}
          event={event}
          stats={stats}
          chartData={chartData}
          users={users}
          prayerTurns={prayerTurns}
          turns={turns}
        />
      )}
    </Suspense>
  );
}
