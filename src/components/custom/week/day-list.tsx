import React, { Suspense } from "react";
import { createTurns } from "@p40/common/utils/schedule";
import { TurnItem } from "../turn/turn-item";
import { WeekSkeleton } from "./skeleton-week";
import { EventResponse } from "@p40/common/contracts/event/event";
import { User } from "@p40/common/contracts/user/user";

interface DayListProps {
  weekday: number;
  weekAbbr: string;
  event: EventResponse;
  prayerTurns: any[];
  turns: any[];
  user: User;
}

export default function DayList({
  weekday,
  weekAbbr,
  event,
  turns,
  user,
}: DayListProps) {
  const filteredTurns = turns.filter((turn) => turn.weekday === weekday);

  return (
    <Suspense fallback={<WeekSkeleton />}>
      <TurnItem
        userId={user.id}
        event={event}
        shift={createTurns(event?.shiftDuration)}
        weekday={weekAbbr}
        turnItens={filteredTurns}
      />
    </Suspense>
  );
}
