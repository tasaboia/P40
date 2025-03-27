import { NextResponse } from "next/server";
import Log from "@p40/services/logging";
import { prisma } from "../prisma";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { errorHandler } from "@p40/common/utils/erro-handler";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId")  

  try {
    
    const checkIns = await prisma.checkIn.findMany({
      where: { userId },
      include: {
        prayerTurn : {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            weekday: true
          }
        },
        event: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({
      success: true,
      data: checkIns
    });
  } catch (error) {
    return errorHandler(error);
    
  }
}

// POST - Criar um novo check-in
export async function POST(request: Request) {
    const { eventId, timestamp, userId } = await request.json();

    console.log(eventId, timestamp, userId)
   
  try {

    const checkInTime = new Date(timestamp || new Date());
    const weekday = checkInTime.getDay();
    const timeString = checkInTime.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: false 
    });

    const turn = await prisma.prayerTurn.findFirst({
        where: {
          eventId: eventId,   
          weekday: weekday,   
          startTime: {
            lte: timeString
          },
          endTime: {
            gte: timeString
          }
        }
      });
      
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheckIn = await prisma.checkIn.findFirst({
      where: {
        userId: userId,
        prayerTurnId: turn.id,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingCheckIn) {
      return NextResponse.json({
        success: true,
        data: existingCheckIn,
        message: "Você já fez check-in neste turno hoje"
      });
    }

    // Criar o novo check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: userId,
        eventId,
        prayerTurnId: turn.id
      },
      include: {
        prayerTurn: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            weekday: true,
            userShifts: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true
                  }
                }
              }
            }
          }
        },
        event: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: checkIn
    });
  } catch (error) {
    return errorHandler(error);
   
  }
}

// Rota para atualizar informações de onboarding do usuário
export async function PUT(request: Request) {
 
  try {
    const { whatsapp, leaderLink, churchId, otherChurch, userId } = await request.json();
    
    console.log("Dados recebidos:", { whatsapp, leaderLink, churchId, otherChurch, userId });
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "ID do usuário é obrigatório"
      }, { status: 400 });
    }
    
    // Preparar objeto de dados com verificações adequadas
    const updateData: any = {
      onboarding: true
    };
    
    // Adicionar os campos apenas se estiverem definidos
    if (whatsapp !== undefined) {
      updateData.whatsapp = whatsapp;
    }
    
    if (leaderLink !== undefined) {
      updateData.leaderLink = leaderLink;
    }
    
    // Verificar se churchId é válido antes de adicioná-lo
    if (churchId !== undefined && churchId !== null && churchId !== "") {
      // Verificar se a igreja existe antes de atualizar
      const churchExists = await prisma.church.findUnique({
        where: { id: churchId }
      });
      
      if (churchExists) {
        updateData.churchId = churchId;
      } else {
        console.log(`Igreja com ID ${churchId} não encontrada. Não será atualizado.`);
      }
    } else {
      // Se churchId for null ou vazio, remover a referência
      updateData.churchId = null;
    }
    
    if (otherChurch !== undefined) {
      updateData.otherChurch = otherChurch;
    }
    
    console.log("Dados para atualização:", updateData);

    // Atualizar dados do usuário
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData
    });

    console.log("Usuário atualizado:", updatedUser);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        whatsapp: updatedUser.whatsapp,
        leaderLink: updatedUser.leaderLink,
        churchId: updatedUser.churchId,
        otherChurch: updatedUser.otherChurch,
        onboarding: updatedUser.onboarding
      }
    });
  } catch (error) {
    console.error("Erro ao atualizar dados do usuário:", error);
    return errorHandler(error);
  }
}

// Rota para obter detalhes sobre um turno específico
export async function PATCH(request: Request) {
    const { turnId } = await request.json();

  try {
   

    const turn = await prisma.prayerTurn.findUnique({
      where: {
        id: turnId
      },
      include: {
        userShifts: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            }
          }
        },
        event: {
          select: {
            id: true,
            name: true
          }
        },
        checkIns: {
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

   

    return NextResponse.json({
      success: true,
      data: turn
    });
  } catch (error) {
    return errorHandler(error);

  }
}
