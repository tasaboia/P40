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

  return {
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
}
