import { NextResponse } from "next/server";
import { prisma } from "@p40/lib/prisma";

export async function GET() {
  try {
    const areas = await prisma.serviceArea.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(areas);
  } catch (error) {
    console.error("Erro ao buscar áreas de serviço:", error);
    return NextResponse.json(
      { error: "Erro ao buscar áreas de serviço" },
      { status: 500 }
    );
  }
} 