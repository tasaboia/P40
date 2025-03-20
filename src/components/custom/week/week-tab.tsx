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

export async function WeekTab({ userId }: { userId: string }) {
  const t = await getTranslations("common");

  const dashboardData = await getAllData(userId);

  if (!dashboardData.success || !dashboardData.data) {
    return (
      <ErrorHandler
        error={{
          title: "Erro ao carregar dados",
          description:
            dashboardData.error ||
            "Não foi possível carregar os dados da agenda",
        }}
      />
    );
  }

  const { event, prayerTurns, turns, user } = dashboardData.data;

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
            <DayList
              weekAbbr={Weekday[dayAbbr]}
              weekday={Object.values(Weekday).indexOf(Weekday[dayAbbr])}
              event={event}
              prayerTurns={prayerTurns}
              turns={turns}
              user={user}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
