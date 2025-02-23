"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@p40/components/ui/chart";

const chartConfig = {
  people: {
    label: "Pessoas",
    color: "hsl(var(--chart-2))",
  },
  emptySlots: {
    label: "Horários Vazios",
    color: "hsl(var(--chart-3))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

export function EventChart({ chartData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2">
          Pessoas e Horários Por Turnos
          <TrendingUp className="h-4 w-4" />
        </CardTitle>
        <CardDescription>Dias da Semana</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const weekdays = [
                  "Dom",
                  "Seg",
                  "Ter",
                  "Qua",
                  "Qui",
                  "Sex",
                  "Sáb",
                ];
                return weekdays[value];
              }}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />

            <Bar dataKey="people" fill="var(--color-people)" radius={4} />
            <Bar
              dataKey="emptySlots"
              fill="var(--color-emptySlots)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[hsl(var(--chart-2))]" />
          <span>Pessoas por dia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[hsl(var(--chart-3))]" />
          <span>Horários vazios</span>
        </div>
      </CardFooter>
    </Card>
  );
}
