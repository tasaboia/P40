import { NextResponse } from "next/server";
import { prisma } from "../prisma";
import { errorHandler } from "@p40/common/utils/erro-handler";
import { PrayerTurnType } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("churchId");
  try {
    const event = await prisma.event.findFirst({
      where: {
        church: {
          id: id,
        },
      },
      include: {
        church: {
          select: {
            name: true,
            city: true,
            country: true,
          },
        },
      },
    });

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const eventId = formData.get("eventId");
    const churchId = formData.get("churchId");

    if (!churchId || typeof churchId !== "string") {
      return NextResponse.json(
        { error: "Church ID não informado." },
        { status: 400 }
      );
    }

    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const type = formData.get("type");
    const maxParticipantsPerTurn = formData.get("maxParticipantsPerTurn");
    const shiftDuration = formData.get("shiftDuration");
    const name = formData.get("name");

    const eventData = {
      name: name ? String(name) : "Evento sem nome",
      churchId,
      startDate: startDate ? new Date(String(startDate)) : new Date(),
      endDate: endDate ? new Date(String(endDate)) : new Date(),
      type: type ? (String(type) as PrayerTurnType) : "SHIFT",
      maxParticipantsPerTurn: maxParticipantsPerTurn
        ? parseInt(String(maxParticipantsPerTurn))
        : 2,
      shiftDuration: shiftDuration ? parseInt(String(shiftDuration)) : 60,
    };

    let event;

    if (eventId && typeof eventId === "string") {
      event = await prisma.event.upsert({
        where: { id: eventId },
        update: eventData,
        create: eventData,
      });
      return NextResponse.json({ event }, { status: 200 });
    } else {
      event = await prisma.event.create({
        data: eventData,
      });
      return NextResponse.json({ event }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Erro ao atualizar/criar evento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}
