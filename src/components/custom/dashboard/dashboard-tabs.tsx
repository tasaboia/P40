import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@p40/components/ui/tabs";
import { WeekTab } from "../week/week-tab";
import { columns } from "@p40/app/[locale]/(auth)/dashboard/components/columns";
import { DataTableWithSearch } from "@p40/app/[locale]/(auth)/dashboard/components/data-table";
import { EventChart } from "./chart-event";
import { useTranslations } from "next-intl";
import { StatsCards } from "./stats-cards";
import { EventResponse } from "@p40/common/contracts/event/event";
import {
  ChartData,
  Leader,
  PrayerTurn,
  PrayerTurnStats,
} from "@p40/common/contracts/prayer-turn/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { User } from "@p40/common/contracts/user/user";
import { getTranslations } from "next-intl/server";

interface DashboardTabsProps {
  event: EventResponse;
  stats: {
    distinctLeaders: string;
    singleLeaderSlots: string;
    filledTimeSlots: string;
    emptyTimeSlots: string;
    expectedSlotsWeek?: number;
    filledSlotsByWeekday?: number[];
    emptySlotsByWeekday?: number[];
  };
  user: User;
  chartData: ChartData[];
  users: Leader[];
  prayerTurns: PrayerTurn[];
  turns: PrayerTurn[];
}

export async function DashboardTabs({
  event,
  stats,
  chartData,
  users,
  user,
}: DashboardTabsProps) {
  const t = await getTranslations("admin.dashboard");

  // Debug logs
  console.log("ChartData:", chartData);
  console.log("Is Array?", Array.isArray(chartData));
  console.log("Length:", chartData?.length);
  console.log("First item:", chartData?.[0]);

  return (
    <Tabs defaultValue="dashboard" className="p-3 ">
      <TabsList className="grid w-full grid-cols-2 max-w-lg">
        <TabsTrigger value="dashboard">{t("tabs.dashboard")}</TabsTrigger>
        <TabsTrigger value="schedule">{t("tabs.schedule")}</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard" className="flex flex-col gap-4">
        <StatsCards stats={stats} />

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            {chartData?.length > 0 && <EventChart chartData={chartData} />}
          </div>

          <div className="w-full md:w-1/2">
            {users?.length > 0 && (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t("stats.registeredLeaders")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTableWithSearch columns={columns} data={users} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="schedule">
        <WeekTab userId={user.id} />
      </TabsContent>
    </Tabs>
  );
}
