import { NextResponse } from "next/server";
import { prisma } from "../../prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json(
      { error: "Parâmetro 'eventId' não informado." },
      { status: 400 }
    );
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        prayerTurns: {
          include: { userShifts: true },
        },
      },
    });

    if (!event || !event.shiftDuration) {
      return NextResponse.json(
        { error: "Evento não encontrado ou shiftDuration não definido." },
        { status: 404 }
      );
    }

    const expectedSlots = Math.floor((24 * 60) / event.shiftDuration);

    const prayerTurns = event.prayerTurns;

    const result = [0, 1, 2, 3, 4, 5, 6].map((day) => {
      const turnsForDay = prayerTurns.filter(
        (turn) => typeof turn.weekday === "number" && turn.weekday === day
      );
      const filledSlots = turnsForDay.filter(
        (turn) => turn.userShifts.length > 0
      ).length;
      const people = turnsForDay.reduce(
        (sum, turn) => sum + turn.userShifts.length,
        0
      );
      return {
        day,
        people,
        emptySlots: expectedSlots - filledSlots,
      };
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error("Erro no endpoint de chart-data:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}
