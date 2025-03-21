// src/app/api/prayer-turn/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../prisma";
import { errorHandler } from "@p40/common/utils/erro-handler";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Parâmetro userId é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const prayerTurns = await prisma.prayerTurn.findMany({
      where: {
        userShifts: {
          some: {
            userId: userId,
          },
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
                email: true,
              },
            },
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            shiftDuration: true,
          },
        },
      },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    });

    if (!prayerTurns || prayerTurns.length === 0) {
      return NextResponse.json({ prayerTurn: [] }, { status: 200 });
    }

    const formattedPrayerTurns = prayerTurns.map((turn) => ({
      id: turn.id,
      startTime: turn.startTime,
      endTime: turn.endTime,
      duration: turn.event?.shiftDuration ?? 60,
      allowChangeAfterStart: turn.allowChangeAfterStart,
      weekday: turn.weekday,
      leaders: turn.userShifts.map((shift) => ({
        id: shift.user.id,
        name: shift.user.name,
        whatsapp: shift.user.whatsapp,
        imageUrl: shift.user.imageUrl,
        email: shift.user.email,
      })),
    }));

    return NextResponse.json(
      { prayerTurn: formattedPrayerTurns },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
