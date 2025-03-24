import { columns } from "@p40/app/[locale]/(private)/dashboard/components/columns";
import { DataTableWithSearch } from "@p40/app/[locale]/(private)/dashboard/components/data-table";
import { EventChart } from "./chart-event";
import { StatsCards } from "./stats-cards";
import { ChartData, Leader } from "@p40/common/contracts/prayer-turn/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { memo } from "react";

interface DashboardTabsProps {
  stats: {
    distinctLeaders: string;
    singleLeaderSlots: string;
    filledTimeSlots: string;
    emptyTimeSlots: string;
    expectedSlotsWeek?: number;
    filledSlotsByWeekday?: number[];
    emptySlotsByWeekday?: number[];
  };
  chartData: ChartData[];
  users: Leader[];
}
const DashboardTabs = memo(
  async ({ stats, chartData, users }: DashboardTabsProps) => {
    const t = await getTranslations("admin.dashboard");

    return (
      <div className="flex flex-col gap-4">
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
      </div>
    );
  }
);
DashboardTabs.displayName = "DashboardTabs";

export default DashboardTabs;
