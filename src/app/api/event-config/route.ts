// src/app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { EventConfigService } from "@p40/services/event-config/event-config.service";

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

    if (user.role !== "ADMIN") {
      return Response.json(
        { message: "Apenas administradores podem acessar o dashboard" },
        { status: 403 }
      );
    }

    const eventConfig = new EventConfigService();
    const config = await eventConfig.getEventConfig(user.churchId);

    return NextResponse.json({
      success: true,
      data: config,
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

export async function PATCH() {
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

    if (user.role !== "ADMIN") {
      return Response.json(
        { message: "Apenas administradores podem acessar o dashboard" },
        { status: 403 }
      );
    }

    const eventConfig = new EventConfigService();
    const config = await eventConfig.updateEventConfig(user.churchId);

    return NextResponse.json({
      success: true,
      data: config,
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
