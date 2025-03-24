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

export default function WeekTab({
  event,
  prayerTurns,
  turns,
  user,
}: {
  event: any;
  prayerTurns: any;
  turns: any;
  user: any;
}) {
  const t = useTranslations("common");
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
