import { NextResponse } from "next/server";
import { prisma } from "../../prisma";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { errorHandler } from "@p40/common/utils/erro-handler";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) {
      throw new FailException({
        message: "E-mail é obrigatório",
        statusCode: 400,
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    return NextResponse.json({ exists: !!user });
  } catch (error) {
    return errorHandler(error);
  }
}
