import { NextResponse } from "next/server";
import { prisma } from "@p40/lib/prisma";

export async function GET() {
  try {
    const serviceAreas = await prisma.serviceArea.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: serviceAreas,
    });
  } catch (error) {
    console.error("Erro ao buscar áreas de serviço:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar áreas de serviço",
      },
      { status: 500 }
    );
  }
} 