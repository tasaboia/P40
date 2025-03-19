"use client";

import { User } from "@p40/common/contracts/user/user";
import { EventResponse } from "@p40/common/contracts/event/event";
import { PrayerTurnResponse } from "@p40/common/contracts/user/user";
import { DashboardTabs } from "@p40/components/custom/dashboard/dashboard-tabs";
import ConfigEvent from "@p40/components/custom/config-event/onboarding";

interface DashboardTabsWrapperProps {
  event: EventResponse;
  stats: {
    distinctLeaders: string;
    singleLeaderSlots: string;
    filledTimeSlots: string;
    emptyTimeSlots: string;
  };
  chartData: any[];
  users: User[];
  prayerTurns: PrayerTurnResponse[];
  turns: any[];
}

interface ConfigEventWrapperProps {
  user: User | null;
  church: string | undefined;
}

export function DashboardTabsWrapper({
  event,
  stats,
  chartData,
  users,
  prayerTurns,
  turns,
}: DashboardTabsWrapperProps) {
  return (
    <DashboardTabs
      event={event}
      stats={stats}
      chartData={chartData}
      users={users}
      prayerTurns={prayerTurns}
      turns={turns}
    />
  );
}

export function ConfigEventWrapper({ user, church }: ConfigEventWrapperProps) {
  return <ConfigEvent user={user} church={church} />;
}
