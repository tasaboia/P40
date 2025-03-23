// src/app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { EventConfigService } from "@p40/services/event-config/event-config.service";

import { prisma } from "../prisma";

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: { churchId: true, role: true },
    });

    if (!user || !user.churchId) {
      return NextResponse.json(
        { message: "Igreja não encontrada" },
        { status: 404 }
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

export async function POST(req: NextRequest) {
  const {
    id,
    name,
    description,
    churchId,
    churchName,
    startDate,
    endDate,
    leadersPerShift,
    allowShiftChange,
    eventType,
    shiftDuration,
  } = await req.json(); // Usando `req.json()` para obter o corpo da requisição

  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: { churchId: true, role: true },
    });

    if (!user || !user.churchId) {
      return NextResponse.json(
        { message: "Igreja não encontrada" },
        { status: 404 }
      );
    }

    // if (user.role !== "ADMIN") {
    //   return NextResponse.json(
    //     { message: "Apenas administradores podem acessar o dashboard" },
    //     { status: 403 }
    //   );
    // }

    const updatedEvent = await prisma.event.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        churchId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxParticipantsPerTurn: leadersPerShift,
        type: eventType,
        shiftDuration,
      },
    });

    if (allowShiftChange) {
      await prisma.prayerTurn.updateMany({
        where: {
          eventId: updatedEvent.id,
        },
        data: {
          allowChangeAfterStart: allowShiftChange,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedEvent,
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
