import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@p40/lib/prisma";
import { TestimonyType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const {
      content,
      type,
      userId,
      churchId,
      date,
      prayerTurnId,
    } = await request.json();

    if (!content) {
      return NextResponse.json({
        success: false,
        message: "O conteúdo do testemunho é obrigatório"
      }, { status: 400 });
    }

    let finalPrayerTurnId = prayerTurnId;

    if (!finalPrayerTurnId) {
      const now = new Date();
      const weekday = now.getDay();
      const timeString = now.toLocaleTimeString("pt-BR", { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: false 
      });

      // Buscar turno atual
      const currentTurn = await prisma.prayerTurn.findFirst({
        where: {
          weekday: weekday,
          startTime: {
            lte: timeString
          },
          endTime: {
            gte: timeString
          }
        }
      });

      // Se não encontrar turno no formato normal, verificar turnos que cruzam a meia-noite
      if (!currentTurn) {
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTimeInMinutes = hours * 60 + minutes;

        const allTurns = await prisma.prayerTurn.findMany({
          where: {
            weekday: weekday
          }
        });

        // Função auxiliar para converter horário em minutos
        const timeToMinutes = (timeStr: string) => {
          const [h, m] = timeStr.split(':').map(Number);
          return h * 60 + m;
        };

        // Procurar um turno que cruza a meia-noite
        const matchingTurn = allTurns.find(turn => {
          const startMinutes = timeToMinutes(turn.startTime);
          let endMinutes = timeToMinutes(turn.endTime);

          // Se o horário de término for menor que o de início, significa que cruza a meia-noite
          if (endMinutes <= startMinutes) {
            endMinutes += 24 * 60; // Adiciona 24 horas
            // Se o horário atual for depois da meia-noite, adiciona 24 horas a ele também
            const adjustedCurrentTime = currentTimeInMinutes + (hours < 12 ? 24 * 60 : 0);
            return adjustedCurrentTime >= startMinutes && adjustedCurrentTime <= endMinutes;
          }

          return currentTimeInMinutes >= startMinutes && currentTimeInMinutes <= endMinutes;
        });

        if (matchingTurn) {
          finalPrayerTurnId = matchingTurn.id;
        }
      } else {
        finalPrayerTurnId = currentTurn.id;
      }
    }

    // Se ainda não encontrou um turno, retorna erro
    if (!finalPrayerTurnId) {
      return NextResponse.json({
        success: false,
        message: "Não foi possível encontrar um turno de oração para este horário"
      }, { status: 404 });
    }

    const prayerTurn = await prisma.prayerTurn.findUnique({
      where: { id: finalPrayerTurnId }
    });

    if (!prayerTurn) {
      return NextResponse.json({
        success: false,
        message: "Turno de oração não encontrado"
      }, { status: 404 });
    }

    const testimony = await prisma.testimony.create({
      data: {
        content,
        type: type || TestimonyType.FAITH,
        userId,
        churchId: churchId || undefined,
        date: new Date(date || new Date()),
        prayerTurnId: finalPrayerTurnId,
        approved: false
      }
    });

    return NextResponse.json({
      success: true,
      data: testimony,
      prayerTurn  
    });

  } catch (error) {
    console.error("Erro ao criar testemunho:", error);
    return NextResponse.json({
      success: false,
      message: "Erro ao processar a requisição"
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type");
    const skip = (page - 1) * limit;

    // Construa o where baseado nos filtros
    const where = {
      ...(type && type !== "ALL" && { type }),
      approved: true,
    };

    // Busca total de registros para paginação
    const total = await prisma.testimony.count({ where: { approved: true } });

    // Busca os testemunhos com paginação
    const testimonies = await prisma.testimony.findMany({
      where: {
        ...(type && type !== "ALL" ? { type: type as TestimonyType } : {}),
        approved: true
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true
          }
        },
        church: {
          select: {
            name: true
          }
        },
        prayerTurn: {
          select: {
            startTime: true,
            endTime: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: testimonies,
      total,
      page,
      limit
    });

  } catch (error) {
    return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
        { status: 500 }
      );
  }
} 

export async function PATCH(req: NextRequest) {
    const { action,testimonyId } = await req.json();

  try {
    
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Ação inválida" },
        { status: 400 }
      );
    }

    const testimony = await prisma.testimony.update({
      where: { id: testimonyId },
      data: {
        approved: action === "approve",
      }
    });

    return NextResponse.json({
      success: true,
      data: testimony
    });

  } catch (error) {
    console.error("Erro ao atualizar testemunho:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao processar a requisição" },
      { status: 500 }
    );
  }
} 