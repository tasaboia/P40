import React, { Suspense } from "react";
import { createTurns } from "@p40/common/utils/schedule";
import { TurnItem } from "../turn/turn-item";
import { EventResponse } from "@p40/common/contracts/event/event";
import { turnByWeekday } from "@p40/services/event/turn-weekday";
import Loading from "@p40/app/[locale]/(auth)/schedule/loading";
import { auth } from "../../../../auth";

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
  const turnItens = await turnByWeekday(weekday, event.id);
  return (
    <Suspense fallback={<Loading />}>
      <TurnItem
        userId={session.user.id}
        event={event}
        shift={shift}
        weekday={weekAbbr}
        turnItens={turnItens}
      />
    </Suspense>
  );
}
