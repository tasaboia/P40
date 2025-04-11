import { NextResponse } from "next/server";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { errorHandler } from "@p40/common/utils/erro-handler";
import { prisma } from "../prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const churchId = searchParams.get("churchId");
  const eventId = searchParams.get("eventId");
  let returnData;
  try {
    if (churchId) {
      const church = await prisma.church.findFirst({
        where: {
          id: churchId,
        },
      });

      returnData = church;
      if (!church) {
        throw new FailException({
          message: "Igreja não encontrada",
          statusCode: 404,
        });
      }
    }

    if (eventId) {
      const event = await prisma.event.findFirst({
        where: {
          id: eventId,
        },
        include: {
          church: true,
        },
      });

      if (!event) {
        throw new FailException({
          message: "Igreja não encontrada",
          statusCode: 404,
        });
      }
      returnData = event.church;
    }

    return NextResponse.json(returnData, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
