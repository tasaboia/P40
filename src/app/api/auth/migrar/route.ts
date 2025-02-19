import { NextResponse } from "next/server";
import { errorHandler } from "@p40/common/utils/erro-handler";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import axios from "axios";
import { prisma } from "../../prisma";

const proverUrl = process.env.PROVER_BASE_URL;
const proverToken = process.env.PROVER_TOKEN;

export async function POST(req: Request) {
  try {
    const { username, password, zionId } = await req.json();

    if (!zionId || !username || !password) {
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

    const userDetailsResponse = await axios.get(
      `https://reports.zionchurch.org.br/util/pessoa/${prover.user.id}`,
      {
        headers: {
          Authorization: `Token ${proverToken}`,
        },
      }
    );
    const userDetails = userDetailsResponse.data.data;

    if (!userDetails || !userDetails.mobile || !userDetails.email) {
      throw new FailException({
        message: "Dados do usuário incompletos ou inválidos.",
        statusCode: 400,
      });
    }

    let user = await prisma.user.findUnique({
      where: { email: userDetails.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          idProver: String(prover.user.id),
          name: prover.user.nome,
          email: userDetails.email,
          imageUrl: `https://sis.sistemaprover.com.br/public/download/${prover.user.foto}`,
          whatsapp: userDetails.mobile,
          churchId: zionId,
        },
      });
    }

    return NextResponse.json(
      { user: { ...user, churchId: zionId }, message: "Login bem-sucedido" },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
