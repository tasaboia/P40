"use client";
import { Weekday } from "@p40/common/contracts/week/schedule";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@p40/components/ui/tabs";
import DayList from "./day-list";
import { today } from "@p40/common/utils/schedule";
import { getAllData } from "@p40/services/dashboard/dashboard-all";
import { ErrorHandler } from "../error-handler";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function WeekTab({ userId }: { userId: string }) {
  const t = useTranslations("common");

  const {
    data: dashboard,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["scheduleData", userId],
    queryFn: () => getAllData(userId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <Tabs defaultValue={today}>
      <TabsList className="sticky top-0 z-10 w-full">
        {Object.keys(Weekday).map((key) => {
          const dayAbbr = key as keyof typeof Weekday;
          return (
            <TabsTrigger key={dayAbbr} value={dayAbbr}>
              {t(`weekdays.${dayAbbr}`)}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {Object.keys(Weekday).map((key) => {
        const dayAbbr = key as keyof typeof Weekday;
        return (
          <TabsContent key={dayAbbr} value={dayAbbr}>
            {!isLoading && (
              <DayList
                weekAbbr={Weekday[dayAbbr]}
                weekday={Object.values(Weekday).indexOf(Weekday[dayAbbr])}
                event={dashboard?.data?.event}
                prayerTurns={dashboard?.data?.prayerTurns}
                turns={dashboard?.data?.turns}
                user={dashboard?.data?.user}
              />
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
