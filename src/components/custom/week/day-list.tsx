"use client";

import React from "react";
import { createTurns } from "@p40/common/utils/schedule";
import { TurnItem } from "../turn/turn-item";
import { WeekSkeleton } from "./skeleton-week";
import { EventResponse } from "@p40/common/contracts/event/event";
import { useSession } from "next-auth/react";

interface DayListProps {
  weekday: number;
  weekAbbr: string;
  event: EventResponse;
  prayerTurns: any[]; // Mantemos na interface mas não usamos diretamente
  turns: any[];
}

export default function DayList({
  weekday,
  weekAbbr,
  event,
  turns,
}: DayListProps) {
  // Todos os hooks devem ser chamados no topo do componente
  const { data: session } = useSession();

  // Filtrar turnos para o dia da semana atual
  const filteredTurns = turns.filter((turn) => turn.weekday === weekday);

  // Se não houver sessão, mostrar skeleton
  if (!session || !session.user) {
    return <WeekSkeleton />;
  }

  return (
    <TurnItem
      userId={session.user.id}
      event={event}
      shift={createTurns(event?.shiftDuration)}
      weekday={weekAbbr}
      turnItens={filteredTurns}
    />
  );
}
