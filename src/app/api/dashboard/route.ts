// app/api/dashboard-stats/route.ts
import { NextResponse } from "next/server";
import { eachDayOfInterval, getDay } from "date-fns";
import { prisma } from "../prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  try {
    const event = await prisma.event.findFirst({ where: { id: eventId } });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Evento não encontrado." },
        { status: 404 }
      );
    }

    const { shiftDuration } = event;
    if (!shiftDuration) {
      return NextResponse.json(
        { success: false, error: "shiftDuration não definido no evento." },
        { status: 400 }
      );
    }

    const slotsPerDay = Math.floor((24 * 60) / shiftDuration);
    const expectedSlotsWeek = 7 * slotsPerDay;

    const prayerTurns = await prisma.prayerTurn.findMany({
      where: { eventId: event.id },
      include: { userShifts: true },
    });

    const allUserIds: string[] = [];
    prayerTurns.forEach((turn) => {
      turn.userShifts.forEach((shift) => {
        allUserIds.push(shift.userId);
      });
    });
    const distinctLeaders = new Set(allUserIds).size;

    const singleLeaderSlots = prayerTurns.filter(
      (turn) => turn.userShifts.length === 1
    ).length;

    const filledTimeSlots = prayerTurns.filter(
      (turn) => turn.userShifts.length >= 1
    ).length;

    const filledSlotsByWeekday = Array(7).fill(0);
    prayerTurns.forEach((turn) => {
      if (
        typeof turn.weekday === "number" &&
        turn.weekday >= 0 &&
        turn.weekday < 7 &&
        turn.userShifts.length > 0
      ) {
        filledSlotsByWeekday[turn.weekday] += 1;
      }
    });
    const emptySlotsByWeekday = filledSlotsByWeekday.map((filled) =>
      Math.max(slotsPerDay - filled, 0)
    );
    const totalEmptySlots = emptySlotsByWeekday.reduce(
      (acc, cur) => acc + cur,
      0
    );

    return NextResponse.json(
      {
        success: true,
        stats: {
          distinctLeaders,
          singleLeaderSlots,
          filledTimeSlots,
          emptyTimeSlots: totalEmptySlots,
          expectedSlotsWeek,
          filledSlotsByWeekday,
          emptySlotsByWeekday,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas do dashboard:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
