"use client";

import { useState } from "react";
import { Weekday } from "@p40/common/contracts/week/schedule";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@p40/components/ui/tabs";
import DayList from "./day-list";
import { today } from "@p40/common/utils/schedule";
import { useTranslations } from "next-intl";
import { useDashboardData } from "@p40/hooks/use-dashboard-data";
import { Loader2 } from "lucide-react";
import { ErrorHandler } from "@p40/components/custom/error-handler";

export default function WeekTab({ userId }: { userId: string }) {
  const t = useTranslations("common");
  const [activeTab, setActiveTab] = useState<string>(today);

  const { data, isLoading, error } = useDashboardData(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">{t("status.loading")}</p>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <ErrorHandler
        title="Erro ao buscar dias da semana"
        message={error?.message || data?.error}
      />
    );
  }

  const { event, prayerTurns, turns, user } = data.data || {};

  if (!event) {
    return <ErrorHandler title={"Evento nao foi encontrado"} />;
  }

  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur-sm shadow-sm mb-2">
        {Object.keys(Weekday).map((key) => {
          const dayAbbr = key as keyof typeof Weekday;
          return (
            <TabsTrigger
              key={dayAbbr}
              value={dayAbbr}
              className="flex-1 py-3 data-[state=active]:bg-primary/10 transition-all duration-200"
            >
              {t(`weekdays.${dayAbbr}`)}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {Object.keys(Weekday).map((key) => {
        const dayAbbr = key as keyof typeof Weekday;
        return (
          <TabsContent key={dayAbbr} value={dayAbbr}>
            <DayList
              weekAbbr={Weekday[dayAbbr]}
              weekday={Object.values(Weekday).indexOf(Weekday[dayAbbr])}
              event={event}
              prayerTurns={prayerTurns || []}
              turns={turns || []}
              user={user}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
