import { NextResponse } from "next/server";
import { errorHandler } from "@p40/common/utils/erro-handler";
import { prisma } from "../../prisma";
import { FailException } from "@p40/common/contracts/exceptions/exception";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const weekday = searchParams.get("weekday");
  const eventId = searchParams.get("eventId");
  try {
    if (!eventId || !weekday) {
      throw new FailException({
        message: "Parâmetros 'eventId' e 'weekday' são obrigatórios.",
        statusCode: 400,
      });
    }
    const prayerTurns = await prisma.prayerTurn.findMany({
      where: {
        eventId: eventId,
        weekday: parseInt(weekday),
      },
      include: {
        userShifts: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                whatsapp: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!prayerTurns || prayerTurns.length === 0) {
      return NextResponse.json(null, { status: 200 });
    }

    const uniqueTurns = prayerTurns.reduce((acc: any[], current: any) => {
      const existing = acc.find(
        (turn) => turn.startTime.getTime() === current.startTime.getTime()
      );
      if (!existing) acc.push(current);
      return acc;
    }, []);

    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };
    const formattedResponse = uniqueTurns.map((turn) => ({
      startTime: formatTime(turn.startTime),
      endTime: formatTime(turn.endTime),
      leaders: turn.userShifts.map((shift) => ({
        id: shift.user.id,
        name: shift.user.name,
        whatsapp: shift.user.whatsapp,
        imageUrl: shift.user.imageUrl,
      })),
    }));

    return NextResponse.json(formattedResponse, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
