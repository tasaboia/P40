"use client";

import { StatsCard } from "@p40/components/custom/dashboard/stats-card";
import { PrayerTurnsChart } from "@p40/components/custom/dashboard/prayer-turns-chart";
import { TurnsList } from "@p40/components/custom/dashboard/turns-list";
import { Users, Users2, Clock } from "lucide-react";
import { useDashboard } from "@p40/contexts/dashboard-context";
import { Suspense } from "react";
import Loading from "../../../app/[locale]/(auth)/loading";

export function DashboardContent() {
  const { turns, prayerTurns } = useDashboard();

  const totalLeaders = turns.reduce(
    (acc, turn) => acc + turn.leaders.length,
    0
  );
  const totalSubscribers = turns.reduce(
    (acc, turn) => acc + turn.subscribers.length,
    0
  );
  const totalTurns = prayerTurns.length;

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Líderes"
            value={totalLeaders}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Total de Inscritos"
            value={totalSubscribers}
            icon={<Users2 className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Total de Turnos"
            value={totalTurns}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <PrayerTurnsChart />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <TurnsList />
        </div>
      </div>
    </Suspense>
  );
}
