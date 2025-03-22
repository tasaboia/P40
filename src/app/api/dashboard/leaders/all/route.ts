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
    const leadersShifts = await dashboardService.getLeaders(churchId);

    return NextResponse.json({
      success: true,
      data: leadersShifts,
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
