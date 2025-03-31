import { NextResponse } from "next/server";
import { prisma } from "@p40/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  try {
    
    const churchId = request.headers.get("churchId");

    // Buscar líderes da mesma igreja do usuário logado
    const leaders = await prisma.user.findMany({
      where: {
        role: Role.LEADER,
        churchId: churchId // Filtrar por igreja do usuário
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        church: {
          select: {
            name: true
          }
        },
        userShifts: {
          select: {
            prayerTurn: {
              select: {
                startTime: true,
                endTime: true,
                weekday: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Formatar os dados dos líderes para incluir informações dos turnos
    const formattedLeaders = leaders.map(leader => ({
      id: leader.id,
      name: leader.name,
      imageUrl: leader.imageUrl,
      churchName: leader.church?.name,
      shifts: leader.userShifts.map(shift => ({
        weekday: shift.prayerTurn.weekday,
        startTime: shift.prayerTurn.startTime,
        endTime: shift.prayerTurn.endTime
      }))
    }));

    return NextResponse.json({
      success: true,
      data: formattedLeaders
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
} 