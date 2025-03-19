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

interface ChartData {
  day: number;
  people: number;
  emptySlots: number;
}

interface EventChartProps {
  chartData: ChartData[];
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CHART_COLORS = {
  people: "#2563eb", // primary blue
  emptySlots: "#94a3b8", // muted gray
};

const CHART_LABELS = {
  people: "Pessoas",
  emptySlots: "Slots vazios",
};

export function EventChart({ chartData }: EventChartProps) {
  const t = useTranslations("admin.dashboard");
  const hasData = Array.isArray(chartData) && chartData.length > 0;

  if (!hasData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("chart.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
          <BarChart3 className="h-12 w-12 mb-2 opacity-20" />
          <p className="text-muted-foreground">{t("chart.description")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {t("chart.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "8px",
                }}
              />
              <Bar
                dataKey="people"
                name={CHART_LABELS.people}
                fill={CHART_COLORS.people}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="emptySlots"
                name={CHART_LABELS.emptySlots}
                fill={CHART_COLORS.emptySlots}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: CHART_COLORS.people }}
            />
            <span className="text-sm text-muted-foreground">
              {CHART_LABELS.people}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: CHART_COLORS.emptySlots }}
            />
            <span className="text-sm text-muted-foreground">
              {CHART_LABELS.emptySlots}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
