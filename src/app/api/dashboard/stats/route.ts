// src/app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { DashboardService } from "@p40/services/dashboard/dashboard.service";
import { prisma } from "../../prisma";

export async function GET(request: NextRequest) {
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
    const stats = await dashboardService.getStats(user.churchId);

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
