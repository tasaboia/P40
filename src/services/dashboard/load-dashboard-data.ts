import { DashboardClient } from "./dashboard-client";

export async function loadDashboardData(churchId: string) {
  const client = new DashboardClient();

  const [
    statsData,
    shiftsData,
    singleLeaderShiftsData,
    leadersData,
    testimoniesData,
  ] = await Promise.all([
    client.getStats(churchId),
    client.getEventTurns(churchId),
    client.getSingleLeaderAndEmptyShifts(churchId),
    client.getEventLeaders(churchId),
    client.getTestemuny(churchId),
  ]);

  return {
    statsData,
    shiftsData,
    singleLeaderShiftsData,
    leadersData,
    testimoniesData,
  };
}
