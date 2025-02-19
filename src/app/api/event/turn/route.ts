import { NextResponse } from "next/server";
import { errorHandler } from "@p40/common/utils/erro-handler";
import { prisma } from "../../prisma";
import { FailException } from "@p40/common/contracts/exceptions/exception";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const weekday = searchParams.get("weekday");
  const eventId = searchParams.get("eventId");
  const userId = searchParams.get("userId");

  try {
    if (!eventId) {
      throw new FailException({
        message: "O parâmetro 'eventId' é obrigatório.",
        statusCode: 400,
      });
    }

    let prayerTurns;

    // 🔥 Caso tenha userId, buscamos todos os turnos desse usuário no evento
    if (userId) {
      prayerTurns = await prisma.prayerTurn.findMany({
        where: {
          eventId: eventId,
          userShifts: {
            some: { userId: userId }, // 🔥 Filtra turnos onde esse usuário está inscrito
          },
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
    }
    // 🔥 Caso contrário, usa o filtro de `weekday` para trazer os turnos do dia específico
    else if (weekday) {
      prayerTurns = await prisma.prayerTurn.findMany({
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
    } else {
      throw new FailException({
        message: "O parâmetro 'weekday' ou 'userId' deve ser fornecido.",
        statusCode: 400,
      });
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId },
    });

    if (!prayerTurns || prayerTurns.length === 0) {
      return NextResponse.json(null, { status: 200 });
    }

    const formattedResponse = prayerTurns.map((turn) => ({
      id: turn.id,
      startTime: turn.startTime,
      endTime: turn.endTime,
      duration: event?.shiftDuration ?? 60,
      allowChangeAfterStart: turn.allowChangeAfterStart,
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
