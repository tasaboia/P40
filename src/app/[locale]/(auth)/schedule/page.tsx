import React from "react";
import { auth } from "../../../../../auth";
import { ErrorHandler } from "@p40/components/custom/error-handler";
import WeekTab from "@p40/components/custom/week/week-tab";
import QueryProvider from "@p40/providers/query-provider";

export default async function SchedulePage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return (
      <ErrorHandler
        error={{
          title: "Não autorizado",
          description: "Você precisa estar logado para acessar esta página",
        }}
        showToast={true}
      />
    );
  }

  return (
    <QueryProvider>
      <div className="flex flex-col gap-4 bg-muted p-4">
        <WeekTab userId={session.user.id} />
      </div>
    </QueryProvider>
  );
}
