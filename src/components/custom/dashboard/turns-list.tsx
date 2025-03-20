"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { useDashboard } from "@p40/contexts/dashboard-context";
import { Skeleton } from "@p40/components/ui/skeleton";
import { Weekday } from "@p40/common/contracts/week/schedule";
import { TurnItem } from "@p40/components/custom/turn/turn-item";

export function TurnsList() {
  const { turns, event, user, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Turnos da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px]" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!event?.id || !user?.id) {
    return null;
  }

  const weekdays = Object.values(Weekday);
  const shifts = weekdays.map((weekday) => ({
    startTime: event.startDate,
    endTime: event.endDate,
  }));

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Turnos da Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {weekdays.map((weekday) => (
            <TurnItem
              key={weekday}
              turnItens={turns}
              weekday={weekday}
              userId={user.id}
              event={event}
              shift={shifts}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
