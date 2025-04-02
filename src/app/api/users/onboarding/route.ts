import { NextResponse } from "next/server";
import { prisma } from "../../prisma";

export async function POST(request: Request) {
  const { isZionMember, leaderLink, otherChurch, whatsapp, name, userId } =
    await request.json();
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        leaderLink: isZionMember ? leaderLink : null,
        otherChurch: !isZionMember ? otherChurch : null,
        whatsapp,
        name: !isZionMember ? name : null,
        onboarding: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Erro ao atualizar onboarding:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
