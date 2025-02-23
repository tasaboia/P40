import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@p40/components/ui/tabs";
import { WeekTab } from "../week/week-tab";
import {
  ClockArrowDown,
  ClockArrowUp,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import {
  columns,
  User as IUser,
} from "@p40/app/[locale]/(auth)/dashboard/components/columns";
import { auth } from "../../../../auth";
import { getUserByChurchId } from "@p40/services/user/user-service";
import { DataTableWithSearch } from "@p40/app/[locale]/(auth)/dashboard/components/data-table";
import { getChartEventData } from "@p40/services/event/chart-event-data";
import { eventByChurchId } from "@p40/services/event/event-byId";
import { EventChart } from "./chart-event";
import { getTranslations } from "next-intl/server";
import { use } from "react";
import { Dashboard } from "@p40/common/contracts/dashboard/dashboard";
import { dashboardData } from "@p40/services/dashboard/dashboard.service";

export async function DashboardTabs() {
  const session = await auth();
  const users = await getUserByChurchId(session.user.churchId);
  const t = await getTranslations("admin.dashboard");

  const event = await eventByChurchId(session.user.churchId);
  if (!event) return null;

  const data = await dashboardData(event.id);
  const chart = await getChartEventData(event.id);

  if (!users.success) return null;
  return (
    <Tabs defaultValue="dashboard" className="p-3">
      <TabsList className="grid w-full grid-cols-2 max-w-lg">
        <TabsTrigger value="dashboard">{t("tabs.dashboard")}</TabsTrigger>
        <TabsTrigger value="schedule">{t("tabs.schedule")}</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard" className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 flex-wrap justify-around">
          <Card>
            <CardHeader className="px-6 pb-2">
              <CardTitle className="bg-muted rounded p-3 max-w-12">
                <Users className="h-6 w-6" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              <span className="text-4xl font-semibold">
                {data.stats.distinctLeaders}
              </span>
              <span className="text-muted-foreground text-xs">
                {t("cards.registeredLeaders")}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-6 pb-2">
              <CardTitle className="bg-muted rounded p-3 max-w-12">
                <User className="h-6 w-6" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              <span className="text-4xl font-semibold">
                {data.stats.singleLeaderSlots}
              </span>
              <span className="text-muted-foreground text-xs max-w-[120px]">
                {t("cards.singleLeaderSlots")}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-6 pb-2">
              <CardTitle className="bg-muted rounded p-3 max-w-12">
                <ClockArrowUp className="h-6 w-6" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              <span className="text-4xl font-semibold">
                {data.stats.filledTimeSlots}
              </span>
              <span className="text-muted-foreground text-xs">
                {t("cards.filledSlots")}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-6 pb-2">
              <CardTitle className="bg-muted rounded p-3 max-w-12">
                <ClockArrowDown className="h-6 w-6" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              <span className="text-4xl font-semibold">
                {data.stats.emptyTimeSlots}
              </span>
              <span className="text-muted-foreground text-xs">
                {t("cards.emptySlots")}
              </span>
            </CardContent>
          </Card>
        </div>
        <EventChart chartData={chart.data} />
        <DataTableWithSearch columns={columns} data={users.users} />
      </TabsContent>
      <TabsContent value="schedule">
        <WeekTab />
      </TabsContent>
    </Tabs>
  );
}
