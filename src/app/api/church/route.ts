import { NextResponse } from "next/server";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { errorHandler } from "@p40/common/utils/erro-handler";
import { prisma } from "../prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const churchId = searchParams.get("churchId");

  try {
    const church = await prisma.church.findFirst({
      where: {
        id: churchId,
      },
    });

    if (!church) {
      throw new FailException({
        message: "Igreja não encontrada",
        statusCode: 404,
      });
    }

    return NextResponse.json(church, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
