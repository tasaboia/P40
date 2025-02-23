import { NextResponse } from "next/server";
import { prisma } from "../prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "UserId não informado" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        church: {
          include: {
            events: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    if (!user.church) {
      return NextResponse.json(
        { error: "Igreja não vinculada ao usuário" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      church: user.church,
      event: user.church.events,
      user: user,
    });
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
