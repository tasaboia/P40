import { DashboardService } from "./dashboard.service";

export async function loadDashboardData(churchId: string) {
  const service = new DashboardService();

  const [stats, allPrayerTurns, singleLeaderShifts, leaders, testimonies] =
    await Promise.all([
      service.getStats(churchId),
      service.getEventTurns(churchId),
      service.getSingleLeaderAndEmptyShifts(churchId),
      service.getLeaders(churchId),
      service.getTestemuny(churchId),
    ]);

  const shiftsData = {
    success: true,
    data: allPrayerTurns.map((turn) => ({
      id: turn.id,
      weekday: turn.weekday,
      startTime: turn.startTime,
      endTime: turn.endTime,
      leaders: turn.userShifts.map((shift) => shift.user),
      status:
        turn.status ||
        (turn.userShifts.length === 0
          ? "empty"
          : turn.userShifts.length === 1
          ? "partial"
          : "full"),
    })),
  };

  return {
    statsData: { success: true, data: stats },
    shiftsData,
    singleLeaderShiftsData: { success: true, data: singleLeaderShifts },
    leadersData: { success: true, data: leaders },
    testimoniesData: { success: true, data: testimonies },
  };
}
