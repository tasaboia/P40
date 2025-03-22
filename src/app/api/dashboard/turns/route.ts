import { DashboardService } from "@p40/services/dashboard/dashboard.service";
import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { prisma } from "../../prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return Response.json({ message: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: { churchId: true, role: true },
    });

    if (!user || !user.churchId) {
      return Response.json(
        { message: "Igreja não encontrada" },
        { status: 404 }
      );
    }

    // if (user.role !== "ADMIN") {
    //   return Response.json(
    //     { message: "Apenas administradores podem acessar o dashboard" },
    //     { status: 403 }
    //   );
    // }

    const dashboardService = new DashboardService();
    const allPrayerTurns = await dashboardService.getEventTurns(user.churchId);

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
