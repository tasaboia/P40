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
      id: turn.id,
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
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const eventId = searchParams.get("eventId");
    const startTime = searchParams.get("startTime");
    const weekday = searchParams.get("weekday");

    if (!userId || !eventId || !startTime || !weekday) {
      throw new FailException({
        message:
          "Parâmetros 'userId', 'eventId', 'startTime' e 'weekday' são obrigatórios.",
        statusCode: 400,
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { prayerTurns: true },
    });

    if (!event) {
      throw new FailException({
        message: "Evento não encontrado.",
        statusCode: 404,
      });
    }

    let prayerTurn = await prisma.prayerTurn.findFirst({
      where: {
        eventId,
        startTime: startTime,
        weekday: parseInt(weekday),
      },
      include: { userShifts: true },
    });

    // Se já existe um turno, adicionamos o usuário como líder
    if (prayerTurn) {
      if (
        event.maxParticipantsPerTurn &&
        prayerTurn.userShifts.length >= event.maxParticipantsPerTurn
      ) {
        throw new FailException({
          message: "Este turno já atingiu o número máximo de participantes.",
          statusCode: 400,
        });
      }

      // 🔥 Adiciona o usuário ao turno existente (se ainda não estiver inscrito)
      await prisma.userShift.upsert({
        where: {
          userId_prayerTurnId: {
            userId,
            prayerTurnId: prayerTurn.id,
          },
        },
        update: {},
        create: {
          userId,
          prayerTurnId: prayerTurn.id,
        },
      });

      return NextResponse.json({
        status: 200,
        message: "Usuário adicionado ao turno existente.",
      });
    }

    // 🔥 Se o turno não existir, criamos um novo e adicionamos o usuário como líder
    const result = await prisma.$transaction(async (prisma) => {
      const newPrayerTurn = await prisma.prayerTurn.create({
        data: {
          eventId,
          startTime: startTime,
          endTime: new Date(
            new Date(startTime).getTime() + event.shiftDuration * 60000
          ),
          duration: event.shiftDuration,
          weekday: parseInt(weekday),
          type: event.type,
          createdAt: new Date(),
        },
      });

      const newUserShift = await prisma.userShift.create({
        data: {
          userId,
          prayerTurnId: newPrayerTurn.id,
        },
      });

      return { newPrayerTurn, newUserShift };
    });

    return NextResponse.json({
      status: 200,
      message: "Novo turno criado e usuário adicionado.",
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const prayerTurnId = searchParams.get("prayerTurnId");

    if (!userId || !prayerTurnId) {
      throw new FailException({
        message: "Parâmetros 'userId' e 'turnId'  são obrigatórios.",
        statusCode: 400,
      });
    }

    const prayerTurn = await prisma.prayerTurn.findFirst({
      where: {
        id: prayerTurnId,
      },
      include: { userShifts: true },
    });

    if (!prayerTurn) {
      throw new FailException({
        message: "Turno não encontrado.",
        statusCode: 404,
      });
    }

    const existingShift = await prisma.userShift.findFirst({
      where: {
        userId,
        prayerTurnId: prayerTurn.id,
      },
    });

    if (!existingShift) {
      throw new FailException({
        message: "Você não está inscrito neste turno.",
        statusCode: 404,
      });
    }

    await prisma.userShift.delete({
      where: { id: existingShift.id },
    });

    return NextResponse.json({
      status: 200,
      message: "Você saiu do turno com sucesso.",
    });
  } catch (error) {
    return errorHandler(error);
  }
}
