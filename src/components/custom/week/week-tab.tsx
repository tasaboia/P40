import { Weekday } from "@p40/common/contracts/schedule/schedule";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@p40/components/ui/tabs";
import DayList from "./day-list";
import { today } from "@p40/common/utils/schedule";
import { eventByChurchId } from "@p40/services/event/event-byId";
import { auth } from "../../../../auth";
import { notFound } from "next/navigation";

export async function WeekTab() {
  const session = await auth();

  if (!session.user.churchId) notFound();
  const event = await eventByChurchId(session.user.churchId);

  return (
    <Tabs defaultValue={today}>
      <TabsList>
        {Object.keys(Weekday).map((key) => {
          const dayAbbr = key as keyof typeof Weekday;
          return (
            <TabsTrigger key={dayAbbr} value={dayAbbr}>
              {Weekday[dayAbbr]}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {Object.keys(Weekday).map((key) => {
        const dayAbbr = key as keyof typeof Weekday;
        return (
          <TabsContent key={dayAbbr} value={dayAbbr}>
            <DayList
              event={event}
              weekAbbr={Weekday[dayAbbr]}
              weekday={Object.values(Weekday).indexOf(Weekday[dayAbbr])}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
