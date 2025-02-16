import { NextResponse } from "next/server";
import { prisma } from "../prisma";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { errorHandler } from "@p40/common/utils/erro-handler";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zionId = searchParams.get("zionId");

    if (!zionId) {
      throw new FailException({
        message: "Nenhuma Zion selecionada",
        statusCode: 400,
      });
    }

    const configs = await prisma.church.findUnique({
      where: { id: zionId },
      include: {
        events: {
          include: {
            prayerTurns: {
              include: {
                userShifts: true,
              },
            },
            prayerTopics: true,
          },
        },
      },
    });

    return NextResponse.json(configs, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
