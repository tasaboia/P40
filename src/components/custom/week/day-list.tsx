import React, { Suspense } from "react";
import { auth } from "../../../../auth";
import { createTurns } from "@p40/common/utils/schedule";
import { eventByChurchId } from "@p40/services/event/event-byId";
import { getTurns } from "@p40/services/event/get-turn";
import { getUser } from "@p40/services/user/user-service";
import { notFound } from "next/navigation";
import { TurnItem } from "../turn/turn-item";
import { WeekSkeleton } from "./skeleton-week";

export default async function DayList({
  weekday,
  weekAbbr,
}: {
  weekday: number;
  weekAbbr: string;
}) {
  //adicinoar toast quando tiver error
  const session = await auth();
  if (!session) return notFound();

  const user = await getUser(session.user.id);
  if (!user || !user.user) return notFound();

  const event = await eventByChurchId(user.user.churchId);
  if (!event) return notFound();

  const turnItens = await getTurns({ eventId: event?.id, weekday });

  return (
    <Suspense fallback={<WeekSkeleton />}>
      <TurnItem
        userId={session.user.id}
        event={event}
        shift={createTurns(event?.shiftDuration)}
        weekday={weekAbbr}
        turnItens={turnItens}
      />
    </Suspense>
  );
}
