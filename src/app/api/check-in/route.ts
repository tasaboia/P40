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

export async function POST(request: Request) {
    const { eventId, timestamp, userId } = await request.json();
   
  try {
    if (!eventId || !userId) {
      return NextResponse.json({
        success: false,
        message: "ID do evento e do usuário são obrigatórios"
      }, { status: 400 });
    }

    const checkInTime = new Date(timestamp || new Date());
    const weekday = checkInTime.getDay();
    
    // Formatação do horário
    const hours = checkInTime.getHours().toString().padStart(2, '0');
    const minutes = checkInTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    console.log("Dados do check-in:", { weekday, timeString });
    
    // Buscar todos os turnos para este dia
    const allTurnsForDay = await prisma.prayerTurn.findMany({
      where: {
        eventId: eventId,
        weekday: weekday
      },
      select: {
        id: true,
        startTime: true,
        endTime: true
      }
    });
    
    // Converter o horário atual para minutos para facilitar comparação
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const currentMinutes = timeToMinutes(timeString);
    
    // Encontrar o turno correto, tratando especialmente turnos que cruzam a meia-noite
    let matchingTurnId = null;
    
    for (const turn of allTurnsForDay) {
      const startMinutes = timeToMinutes(turn.startTime);
      let endMinutes = timeToMinutes(turn.endTime);
      
      // Tratamento especial para turnos que terminam à meia-noite ou depois
      if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60; // Adiciona 24 horas em minutos
      }
      
      // Verificar se o horário atual está dentro deste intervalo
      if (currentMinutes >= startMinutes && 
          (currentMinutes <= endMinutes || 
           (turn.endTime === "00:00" && currentMinutes + (24 * 60) <= endMinutes))) {
        matchingTurnId = turn.id;
        console.log(`Turno encontrado: ${turn.startTime} - ${turn.endTime}`);
        break;
      }
    }
    
    if (!matchingTurnId) {
      return NextResponse.json({
        success: false,
        message: "Não foi encontrado nenhum turno para este horário",
        debug: {
          weekday,
          timeString,
          availableTurns: allTurnsForDay
        }
      }, { status: 404 });
    }

    // Verificar se já existe check-in para hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheckIn = await prisma.checkIn.findFirst({
      where: {
        userId: userId,
        prayerTurnId: matchingTurnId,
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
        prayerTurnId: matchingTurnId
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
    console.error("Erro no check-in:", error);
    return errorHandler(error);
  }
}

// Rota para atualizar informações de onboarding do usuário
export async function PUT(request: Request) {
  const { whatsapp, leaderLink, churchId, otherChurch, userId } = await request.json();
 
  try {
    
    
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
    
    if (churchId !== undefined) {
      updateData.churchId = churchId;
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
