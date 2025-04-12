import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { prisma } from "../../prisma";

export async function GET() {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: "Não autorizado"
      }, { status: 401 });
    }

    // Buscar todos os check-ins com detalhes do usuário, evento e turno
    const checkIns = await prisma.checkIn.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            whatsapp: true,
            churchId: true,
            otherChurch: true,
            leaderLink: true,
          }
        },
        event: {
          select: {
            id: true,
            name: true,
          }
        },
        prayerTurn: {
          select: {
            startTime: true,
            endTime: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        checkIns
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Erro ao buscar estatísticas de check-in"
    }, { status: 500 });
  }
} 