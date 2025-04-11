import { NextResponse } from "next/server";
import { prisma } from "../../prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      email,
      whatsapp,
      zionId,
      serviceAreas: areas,
      role,
    } = body;

    if (!id) {
      throw new Error("ID do usuário é obrigatório");
    }

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: {
          name,
          email,
          whatsapp,
          churchId: zionId,
          role,
        },
      });

      if (areas && Array.isArray(areas) && areas.length > 0) {
        console.log("Atualizando áreas de serviço...");

        // Primeiro remove todas as áreas existentes
        await tx.userServiceArea.deleteMany({
          where: { userId: id },
        });

        // Aguarda a deleção completar antes de criar novas
        const validAreas = areas.filter((area) => area && area.id);

        if (validAreas.length > 0) {
          // Cria as novas áreas uma por uma para evitar conflitos
          for (const area of validAreas) {
            try {
              await tx.userServiceArea.create({
                data: {
                  userId: user.id,
                  serviceAreaId: area.id,
                },
              });
            } catch (error) {
              console.warn(
                `Erro ao criar área ${area.id} para usuário ${user.id}:`,
                error
              );
              // Continua com as próximas áreas mesmo se uma falhar
            }
          }
        }
      }

      return NextResponse.json({
        user,
        message: "Usuário atualizado com sucesso",
      });
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

// Opcional: Endpoint para buscar áreas de um usuário
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    const userAreas = await prisma.userServiceArea.findMany({
      where: { userId },
      include: {
        serviceArea: true,
      },
    });

    return NextResponse.json({ success: true, areas: userAreas });
  } catch (error) {
    console.error("Erro ao buscar áreas do usuário:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
