import { NextResponse } from "next/server";
import { prisma } from "@p40/lib/prisma";

// Cache para os turnos de oração
let prayerTurnsCache: any = null;
let lastFetch: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function GET(request: Request) {
  try {

    // Verificar cache
    if (prayerTurnsCache && (Date.now() - lastFetch < CACHE_DURATION)) {
      return NextResponse.json({
        success: true,
        data: prayerTurnsCache
      });
    }

    const prayerTurns = await prisma.prayerTurn.findMany({
      select: {
        id: true,
        startTime: true,
        endTime: true,
        weekday: true,
        event: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { weekday: 'asc' },
        { startTime: 'asc' }
      ]
    });

    // Atualizar cache
    prayerTurnsCache = prayerTurns;
    lastFetch = Date.now();

    return NextResponse.json({
      success: true,
      data: prayerTurns
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
}
