import React, { Suspense } from "react";
import Loading from "../loading";
import { ErrorHandler } from "@p40/components/custom/error-handler";
import { auth } from "../../../../../auth";
import { getDashboardAllData } from "@p40/services/dashboard/dashboard-all";
import { ConfigEventWrapper, DashboardTabsWrapper } from "./client-components";
import { getTranslations } from "next-intl/server";

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

  const dashboardData = await getDashboardAllData(session.user.id);

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
        <ConfigEventWrapper user={user} church={user?.churchId} />
      )}

      {event && !Array.isArray(event) && (
        <DashboardTabsWrapper
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
