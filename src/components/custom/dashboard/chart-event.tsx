"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { BarChart3 } from "lucide-react";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CHART_CONFIG = {
  labels: {
    people: "Pessoas",
    emptySlots: "Slots vazios",
  },
  colors: {
    people: "#2563eb", // primary blue
    emptySlots: "#94a3b8", // muted gray
  },
};

interface ChartData {
  day: number;
  people: number;
  emptySlots: number;
}

interface EventChartProps {
  chartData: ChartData[];
}

export function EventChart({ chartData }: EventChartProps) {
  const t = useTranslations("admin.dashboard");

  const formattedData = chartData.map((item) => ({
    day: Number(item.day),
    people: Number(item.people),
    emptySlots: Number(item.emptySlots),
  }));

  return (
    <Card className="h-full min-h-[500px] md:h-full ">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {t("chart.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex   flex-col h-[calc(100%-4rem)]">
        <div className="flex-1 min-h-[400px] max-h-[550px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="day"
                tickFormatter={(value) => WEEKDAYS[value]}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                labelFormatter={(value) => WEEKDAYS[value]}
                formatter={(value, name) => [
                  value,
                  name === "people" ? "Pessoas" : "Slots vazios",
                ]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "8px",
                }}
              />
              <Bar
                dataKey="people"
                name="Pessoas"
                fill={CHART_CONFIG.colors.people}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="emptySlots"
                name="Slots vazios"
                fill={CHART_CONFIG.colors.emptySlots}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: CHART_CONFIG.colors.people }}
            />
            <span className="text-sm text-muted-foreground">
              {CHART_CONFIG.labels.people}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: CHART_CONFIG.colors.emptySlots }}
            />
            <span className="text-sm text-muted-foreground">
              {CHART_CONFIG.labels.emptySlots}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
