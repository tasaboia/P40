import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { DashboardService } from "@p40/services/dashboard/dashboard.service";
import { prisma } from "../../prisma";

export async function GET(request: NextRequest) {
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
    const stats = await dashboardService.getStats(churchId);

    return NextResponse.json({
      success: true,
      data: stats,
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
