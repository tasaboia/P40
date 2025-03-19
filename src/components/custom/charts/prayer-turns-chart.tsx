"use client";

import { ResponsiveBar } from "@nivo/bar";
import { PrayerTurnResponse } from "@p40/common/contracts/user/user";

interface PrayerTurnsChartProps {
  data: PrayerTurnResponse[];
}

export function PrayerTurnsChart({ data }: PrayerTurnsChartProps) {
  const chartData = data.map((turn) => ({
    startTime: turn.startTime,
    totalSubscribers: turn.leaders.length,
  }));

  return (
    <div className="h-[300px]">
      <ResponsiveBar
        data={chartData}
        indexBy="startTime"
        keys={["totalSubscribers"]}
        padding={0.3}
        valueScale={{ type: "linear" }}
        colors={{ scheme: "nivo" }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Pessoas",
          legendPosition: "middle",
          legendOffset: -40,
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: "Horários",
          legendPosition: "middle",
          legendOffset: 32,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        theme={{
          axis: {
            ticks: {
              text: {
                fill: "#666",
              },
            },
            legend: {
              text: {
                fill: "#666",
              },
            },
          },
          grid: {
            line: {
              stroke: "#ddd",
              strokeWidth: 1,
            },
          },
        }}
      />
    </div>
  );
}
