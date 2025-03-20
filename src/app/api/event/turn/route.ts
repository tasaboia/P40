import { NextResponse } from "next/server";
import { errorHandler } from "@p40/common/utils/erro-handler";
import { prisma } from "../../prisma";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import {
  CreatePrayerTurnDTOSchema,
  RemovePrayerTurnDTOSchema,
} from "@p40/common/contracts/prayer-turn/validation";
import { z } from "zod";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const weekday = searchParams.get("weekday");
  const eventId = searchParams.get("eventId");

  try {
    if (!eventId) {
      throw new FailException({
        message: "O parâmetro 'eventId' é obrigatório.",
        statusCode: 400,
      });
    }

    let prayerTurns;

    if (weekday) {
      // Validar weekday
      const weekdayNumber = parseInt(weekday);
      if (isNaN(weekdayNumber) || weekdayNumber < 0 || weekdayNumber > 6) {
        throw new FailException({
          message: "O parâmetro 'weekday' deve ser um número entre 0 e 6.",
          statusCode: 400,
        });
      }

      prayerTurns = await prisma.prayerTurn.findMany({
        where: {
          eventId: eventId,
          weekday: weekdayNumber,
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
                  email: true,
                  churchId: true,
                },
              },
            },
          },
        },
      });
    } else {
      prayerTurns = await prisma.prayerTurn.findMany({
        where: {
          eventId: eventId,
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
                  email: true,
                  churchId: true,
                },
              },
            },
          },
        },
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
      weekday: turn.weekday,
      leaders: turn.userShifts.map((shift) => ({
        id: shift.user.id,
        name: shift.user.name,
        whatsapp: shift.user.whatsapp,
        imageUrl: shift.user.imageUrl,
        email: shift.user.email,
        churchId: shift.user.churchId,
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

    // Validar parâmetros com Zod
    const validationResult = CreatePrayerTurnDTOSchema.safeParse({
      userId: searchParams.get("userId"),
      eventId: searchParams.get("eventId"),
      startTime: searchParams.get("startTime"),
      weekday: searchParams.get("weekday"),
    });

    if (!validationResult.success) {
      throw new FailException({
        message: "Parâmetros inválidos: " + validationResult.error.message,
        statusCode: 400,
      });
    }

    const { userId, eventId, startTime, weekday } = validationResult.data;

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

    const prayerTurn = await prisma.prayerTurn.findFirst({
      where: {
        eventId,
        startTime,
        weekday,
      },
      include: { userShifts: true },
    });

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

      const existingUserShift = await prisma.userShift.findFirst({
        where: {
          userId,
          prayerTurnId: prayerTurn.id,
        },
      });

      if (!existingUserShift) {
        await prisma.userShift.create({
          data: {
            userId,
            prayerTurnId: prayerTurn.id,
          },
        });
      }

      return NextResponse.json({
        error: false,
        message: "Usuário adicionado ao turno existente.",
      });
    }

    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours);
    startDate.setMinutes(minutes);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    const endDate = new Date(
      startDate.getTime() + (event.shiftDuration || 60) * 60000
    );

    const endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const result = await prisma.$transaction(async (prisma) => {
      const newPrayerTurn = await prisma.prayerTurn.create({
        data: {
          eventId,
          startTime,
          endTime,
          duration: event.shiftDuration,
          weekday,
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
      error: false,
      message: "Novo turno criado e usuário adicionado.",
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Validar parâmetros com Zod
    const deleteValidation = RemovePrayerTurnDTOSchema.safeParse({
      userId: searchParams.get("userId") || "",
      prayerTurnId: searchParams.get("prayerTurnId") || "",
    });

    if (!deleteValidation.success) {
      throw new FailException({
        message: "Parâmetros inválidos: " + deleteValidation.error.message,
        statusCode: 400,
      });
    }

    const { userId, prayerTurnId } = deleteValidation.data;

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
