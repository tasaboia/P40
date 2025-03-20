import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { ClockArrowDown, ClockArrowUp, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";

interface StatsCardsProps {
  stats: {
    distinctLeaders: string;
    singleLeaderSlots: string;
    filledTimeSlots: string;
    emptyTimeSlots: string;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const t = useTranslations("admin.dashboard");

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
      <Card className="min-w-[140px]">
        <CardHeader className="px-6 pb-2">
          <CardTitle className="bg-muted rounded p-3 max-w-12">
            <Users className="h-6 w-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <span className="text-4xl font-semibold">
            {stats.distinctLeaders}
          </span>
          <span className="text-muted-foreground text-xs">
            {t("stats.registeredLeaders")}
          </span>
        </CardContent>
      </Card>

      <Card className="min-w-[140px]">
        <CardHeader className="px-6 pb-2">
          <CardTitle className="bg-muted rounded p-3 max-w-12">
            <User className="h-6 w-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <span className="text-4xl font-semibold">
            {stats.singleLeaderSlots}
          </span>
          <span className="text-muted-foreground text-xs max-w-[120px]">
            {t("stats.singleLeaderSlots")}
          </span>
        </CardContent>
      </Card>

      <Card className="min-w-[140px]">
        <CardHeader className="px-6 pb-2">
          <CardTitle className="bg-muted rounded p-3 max-w-12">
            <ClockArrowUp className="h-6 w-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <span className="text-4xl font-semibold">
            {stats.filledTimeSlots}
          </span>
          <span className="text-muted-foreground text-xs">
            {t("stats.filledSlots")}
          </span>
        </CardContent>
      </Card>

      <Card className="min-w-[140px]">
        <CardHeader className="px-6 pb-2">
          <CardTitle className="bg-muted rounded p-3 max-w-12">
            <ClockArrowDown className="h-6 w-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <span className="text-4xl font-semibold">{stats.emptyTimeSlots}</span>
          <span className="text-muted-foreground text-xs">
            {t("stats.emptySlots")}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
