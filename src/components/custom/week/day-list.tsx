import React, { Suspense } from "react";
import { createTurns } from "@p40/common/utils/schedule";
import { TurnItem } from "../turn/turn-item";
import { EventResponse } from "@p40/common/contracts/event/event";
import Loading from "@p40/app/[locale]/(auth)/schedule/loading";
import { auth } from "../../../../auth";
import { getTurns } from "@p40/services/event/get-turn";

export default async function DayList({
  weekday,
  event,
  weekAbbr,
}: {
  weekday: number;
  weekAbbr: string;
  event: EventResponse | null;
}) {
  const session = await auth();
  const shift = createTurns(event?.shiftDuration);
  const turnItens = await getTurns({ eventId: event?.id, weekday });
  return (
    <TurnItem
      userId={session.user.id}
      event={event}
      shift={shift}
      weekday={weekAbbr}
      turnItens={turnItens}
    />
  );
}
