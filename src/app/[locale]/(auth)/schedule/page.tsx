import React from "react";
import { auth } from "../../../../../auth";
import { ErrorHandler } from "@p40/components/custom/error-handler";
import WeekTab from "@p40/components/custom/week/week-tab";

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
