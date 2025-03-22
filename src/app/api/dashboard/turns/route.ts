import { DashboardService } from "@p40/services/dashboard/dashboard.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const churchId = searchParams.get("churchId");
  try {
    if (!churchId) {
      return Response.json(
        { message: "Igreja não encontrada" },
        { status: 404 }
      );
    }

    const dashboardService = new DashboardService();
    const allPrayerTurns = await dashboardService.getEventTurns(churchId);

    const turns = allPrayerTurns.map((turn) => {
      return {
        id: turn.id,
        weekday: turn.weekday,
        startTime: turn.startTime,
        endTime: turn.endTime,
        leaders: turn.userShifts.map((shift) => shift.user),
        status:
          turn.userShifts.length === 0
            ? "empty"
            : turn.userShifts.length === 1
            ? "partial"
            : "full",
      };
    });

    return NextResponse.json({
      success: true,
      data: turns,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
