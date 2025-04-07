import { NextResponse } from "next/server";
import { prisma } from "@p40/lib/prisma";

export async function PUT(request: Request) {
  const { serviceAreaIds,userId } = await request.json();
  try {

    // Primeiro, removemos todas as áreas de serviço existentes do usuário
    await prisma.userServiceArea.deleteMany({
      where: {
        userId,
      },
    });

    // Depois, criamos as novas áreas de serviço
    const userServiceAreas = await prisma.userServiceArea.createMany({
      data: serviceAreaIds.map((areaId: string) => ({
        userId,
        serviceAreaId: areaId,
      })),
    });

    return NextResponse.json({
      success: true,
      data: userServiceAreas,
    });
  } catch (error) {
    console.error("Erro ao atualizar áreas de serviço:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao atualizar áreas de serviço",
      },
      { status: 500 }
    );
  }
} 