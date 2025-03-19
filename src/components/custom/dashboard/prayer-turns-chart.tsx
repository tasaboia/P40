"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { useDashboard } from "@p40/contexts/dashboard-context";
import { ResponsiveBar } from "@nivo/bar";
import { Skeleton } from "@p40/components/ui/skeleton";

export function PrayerTurnsChart() {
  const { prayerTurns, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Turnos de Oração</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const data = prayerTurns.map((turn) => ({
    weekday: turn.weekday,
    total: turn.total,
  }));

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Turnos de Oração</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveBar
            data={data}
            keys={["total"]}
            indexBy="weekday"
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            colors={{ scheme: "nivo" }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Dia da Semana",
              legendPosition: "middle",
              legendOffset: 32,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Total",
              legendPosition: "middle",
              legendOffset: -40,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            animate={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
