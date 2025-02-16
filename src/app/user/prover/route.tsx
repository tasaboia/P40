import { FailException } from "@p40/common/contracts/exceptions/exception";
import { errorHandler } from "@p40/common/utils/erro-handler";
import api from "@p40/lib/axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      throw new FailException({
        message: "ID do usuário é obrigatório",
        statusCode: 400,
      });
    }

    const response = await api.post(
      "https://us-central1-forty-days-of-prayer.cloudfunctions.net/api/pessoa/dadosExtrasPorId",
      { id }
    );

    return NextResponse.json(response.data.dados, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
