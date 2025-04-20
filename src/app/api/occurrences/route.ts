import { NextResponse } from "next/server";
import { prisma } from "@p40/lib/prisma";
import { OccurrenceType } from "@prisma/client";

export async function GET(request: Request) {
  try {

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") as OccurrenceType | null;
    const churchId = searchParams.get("churchId") as OccurrenceType | null;

    const skip = (page - 1) * limit;

    const where = {
      ...(type && { type }),
      churchId: churchId,
    };

    const [occurrences, total] = await Promise.all([
      prisma.occurrence.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              imageUrl: true,
            },
          },
          church: {
            select: {
              name: true,
            },
          },
          prayerTurn: {
            select: {
              startTime: true,
              endTime: true,
            },
          },
          relatedLeader: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.occurrence.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: occurrences,
      total,
    });
  } catch (error) {
    console.error("Erro ao buscar ocorrências:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, type, relatedLeaderId, userId, churchId, prayerTurnId } = body;

    if (!content || !type || !userId || !churchId || !prayerTurnId) {
      return NextResponse.json(
        { success: false, error: "Dados obrigatórios faltando (content, type, userId, churchId, prayerTurnId)" },
        { status: 400 }
      );
    }

    // Verifica líder apenas se for ocorrência relacionada a líder
    if (
      (type === OccurrenceType.LEADER_ABSENCE || type === OccurrenceType.LEADER_DELAY) &&
      relatedLeaderId
    ) {
      const leader = await prisma.user.findUnique({
        where: { id: relatedLeaderId },
        select: { role: true },
      });

      if (!leader || leader.role !== "LEADER") {
        return NextResponse.json(
          { success: false, error: "Líder não encontrado" },
          { status: 404 }
        );
      }
    }

    const occurrence = await prisma.occurrence.create({
      data: {
        content,
        type,
        userId,
        churchId,
        prayerTurnId,
        date: new Date(),
        relatedLeaderId,
      },
    });

    return NextResponse.json({
      success: true,
      data: occurrence,
    });
  } catch (error) {
    console.error("Erro ao criar ocorrência:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
} 