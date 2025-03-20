import React, { Suspense } from "react";
import Loading from "../loading";
import { WeekTab } from "@p40/components/custom/week/week-tab";
import { auth } from "../../../../../auth";
import { getDashboardAllData } from "@p40/services/dashboard/dashboard-all";
import { ErrorHandler } from "@p40/components/custom/error-handler";

export default async function SchedulePage() {
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

  return (
    <div className="flex flex-col gap-4 bg-muted p-4">
      <WeekTab userId={session.user.id} />
    </div>
  );
}
