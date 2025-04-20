import { NextResponse } from "next/server";
import { prisma } from "@p40/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekday = parseInt(searchParams.get("weekday") || "0");
    const time = searchParams.get("time") || "";

    // Validar parâmetros
    if (isNaN(weekday) || !time) {
      return NextResponse.json(
        { success: false, error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    // Buscar o turno atual
    const currentPrayerTurn = await prisma.prayerTurn.findFirst({
      where: {
        weekday,
        startTime: {
          lte: time
        },
        endTime: {
          gte: time
        }
      }
    });

    if (!currentPrayerTurn) {
      // Se não encontrar um turno para o horário exato, retornamos o primeiro turno do dia
      const fallbackPrayerTurn = await prisma.prayerTurn.findFirst({
        where: {
          weekday
        },
        orderBy: {
          startTime: 'asc'
        }
      });

      if (!fallbackPrayerTurn) {
        return NextResponse.json(
          { success: false, error: "Nenhum turno encontrado para este dia" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: fallbackPrayerTurn
      });
    }

    return NextResponse.json({
      success: true,
      data: currentPrayerTurn
    });
  } catch (error) {
    console.error("Erro ao buscar turno atual:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
} 