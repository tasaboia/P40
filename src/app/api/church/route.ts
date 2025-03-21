import { NextResponse } from "next/server";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { errorHandler } from "@p40/common/utils/erro-handler";
import { prisma } from "../prisma";
import { auth } from "../../../../auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const churchId = searchParams.get("churchId");

  const session = await auth();

  if (!session || !session.user) {
    return Response.json({ message: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { churchId: true, role: true },
  });

  if (!user || !user.churchId) {
    return Response.json({ message: "Igreja não encontrada" }, { status: 404 });
  }
  try {
    const church = await prisma.church.findFirst({
      where: {
        id: user.churchId,
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
