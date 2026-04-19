import { DashboardService } from "./dashboard.service";
import {
  DashboardStatsResponse,
  Leader,
  LeadersDashboardResponse,
  Shift,
  ShiftResponse,
  SingleLeaderShiftResponse,
  Testimony,
  TestimonyDashboardResponse,
} from "@p40/common/contracts/dashboard/dashboard";

function toShiftResponse(
  shifts: Awaited<ReturnType<DashboardService["getEventTurns"]>>,
): ShiftResponse {
  return {
    success: true,
    data: shifts.map((turn) => ({
      id: turn.id,
      startTime: turn.startTime,
      endTime: turn.endTime,
      weekday: turn.weekday,
      status: turn.status,
      leaders: turn.userShifts.map((shift) => shift.user),
    })),
  };
}

function toSingleLeaderShiftResponse(
  shifts: Awaited<
    ReturnType<DashboardService["getSingleLeaderAndEmptyShifts"]>
  >,
): SingleLeaderShiftResponse {
  return {
    success: true,
    data: shifts.map((shift) => ({
      id: shift.id,
      startTime: shift.startTime,
      endTime: shift.endTime,
      weekday: shift.weekday,
      prayerTurn: shift.prayerTurn,
      church: shift.church,
      leaders: (shift.leaders || []).map(
        (leader): Leader => ({
          id: leader.id,
          name: leader.name,
          imageUrl: leader.imageUrl,
        }),
      ),
    })) as Shift[],
  };
}

function toTestimonyDashboardResponse(
  testimonies: Awaited<ReturnType<DashboardService["getTestemuny"]>>,
): TestimonyDashboardResponse {
  return {
    success: true,
    data: testimonies.map(
      (testimony): Testimony => ({
        id: testimony.id,
        userId: testimony.userId,
        churchId: testimony.churchId,
        date: testimony.date,
        content: testimony.content,
        approved: testimony.approved,
        type: testimony.type as Testimony["type"],
        prayerTurnId: testimony.prayerTurnId,
        user: {
          id: testimony.user.id,
          name: testimony.user.name,
        },
        prayerTurn: {
          id: testimony.prayerTurn.id,
          startTime: testimony.prayerTurn.startTime,
          endTime: testimony.prayerTurn.endTime,
          weekday: testimony.prayerTurn.weekday,
          type: testimony.prayerTurn.type || undefined,
          eventId: testimony.prayerTurn.eventId || undefined,
        },
      }),
    ),
  };
}

async function timed<T>(
  label: string,
  requestId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    console.info(
      `[dashboard-load][${requestId}] ${label} ok in ${Date.now() - start}ms`,
    );
    return result;
  } catch (error) {
    console.error(
      `[dashboard-load][${requestId}] ${label} failed after ${Date.now() - start}ms`,
      error,
    );
    throw error;
  }
}

export async function loadDashboardData(churchId: string) {
  const requestId = `dash-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const start = Date.now();
  console.info(`[dashboard-load][${requestId}] start churchId=${churchId}`);

  const service = new DashboardService();

  try {
    const [stats, allPrayerTurns, singleLeaderShifts, leaders, testimonies] =
      await Promise.all([
        timed("getStats", requestId, () => service.getStats(churchId)),
        timed("getEventTurns", requestId, () =>
          service.getEventTurns(churchId),
        ),
        timed("getSingleLeaderAndEmptyShifts", requestId, () =>
          service.getSingleLeaderAndEmptyShifts(churchId),
        ),
        timed("getLeaders", requestId, () => service.getLeaders(churchId)),
        timed("getTestemuny", requestId, () => service.getTestemuny(churchId)),
      ]);

    const response = {
      statsData: {
        success: true,
        data: stats,
      } as DashboardStatsResponse,
      shiftsData: toShiftResponse(allPrayerTurns),
      singleLeaderShiftsData: toSingleLeaderShiftResponse(singleLeaderShifts),
      leadersData: {
        success: true,
        data: leaders,
      } as LeadersDashboardResponse,
      testimoniesData: toTestimonyDashboardResponse(testimonies),
    };

    console.info(
      `[dashboard-load][${requestId}] success in ${Date.now() - start}ms turns=${response.shiftsData.data.length} leaders=${response.leadersData.data.length} testimonies=${response.testimoniesData.data.length}`,
    );

    return response;
  } catch (error) {
    console.error(
      `[dashboard-load][${requestId}] failed in ${Date.now() - start}ms`,
      error,
    );
    throw error;
  }
}
