import { NextResponse } from "next/server";
import { errorHandler } from "@p40/common/utils/erro-handler";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import axios from "axios";
import { prisma } from "../../prisma";

const proverUrl = process.env.PROVER_BASE_URL;
const proverToken = process.env.PROVER_TOKEN;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Corpo da requisição recebido:", body);

    const { username, password, zionId, serviceAreas, userType } = body;

    let areas = [];
    const role = userType || "LEADER";

    if (typeof serviceAreas === "string") {
      try {
        areas = JSON.parse(serviceAreas);
      } catch {
        areas = serviceAreas.split(",");
      }
    } else if (Array.isArray(serviceAreas)) {
      areas = serviceAreas;
    }

    console.log("Áreas após conversão:", areas);

    if (!username || !password || !zionId) {
      throw new FailException({
        message: "Dados inválidos",
        statusCode: 400,
      });
    }

    const authResponse = await axios.post(`${proverUrl}/login/user`, {
      usuario: username,
      senha: password,
    });

    const prover = authResponse.data;

    if (prover.error) {
      throw new FailException({
        message: "Autenticação falhou no Prover",
        statusCode: 401,
      });
    }

    let userData = {
      idProver: String(prover.user.id),
      name: prover.user.nome,
      email: username,
      imageUrl: `https://sis.sistemaprover.com.br/public/download/${prover.user.foto}`,
      churchId: zionId,
      serviceAreas: areas,
      whatsapp: null,
      role: role,
    };

    try {
      const userDetailsResponse = await axios.get(
        `https://reports.zionchurch.org.br/util/pessoa/${prover.user.id}`,
        {
          headers: {
            Authorization: `Token ${proverToken}`,
          },
        }
      );

      const userDetails = userDetailsResponse.data;

      if (userDetails) {
        userData = {
          ...userData,
          whatsapp: userDetails.mobile || null,
        };
      }
    } catch (detailsError) {
      console.warn("Erro ao buscar detalhes do usuário:", detailsError);
    }

    let user = await prisma.user.findUnique({
      where: { email: username },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          idProver: userData.idProver,
          name: userData.name,
          email: userData.email,
          imageUrl: userData.imageUrl,
          whatsapp: userData.whatsapp,
          churchId: userData.churchId,
          role: role,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { email: username },
        data: {
          idProver: userData.idProver,
          name: userData.name,
          email: userData.email,
          imageUrl: userData.imageUrl,
          whatsapp: userData.whatsapp || user.whatsapp,
          churchId: userData.churchId,
          role,
        },
      });
    }

    // Atualização das áreas de serviço
    if (areas && areas.length > 0) {
      console.log("Atualizando áreas para usuário:", {
        userId: user.id,
        areas: areas, // Agora é garantido que seja um array
      });

      await prisma.$transaction(async (tx) => {
        await tx.userServiceArea.deleteMany({
          where: { userId: user.id },
        });

        // Garante que cada área tem um id válido
        const validAreas = areas.filter((area) => area && area.id);

        if (validAreas.length > 0) {
          await tx.userServiceArea.createMany({
            data: validAreas.map((area) => ({
              userId: user.id,
              serviceAreaId: area.id,
            })),
          });
        }
      });
    }

    return NextResponse.json(
      {
        user: {
          ...user,
          churchId: zionId,
          serviceAreas: areas,
        },
        message: "Login bem-sucedido",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro na migração:", error);
    return errorHandler(error);
  }
}
