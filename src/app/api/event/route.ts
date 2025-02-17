import { NextResponse } from "next/server";
import { prisma } from "../prisma";
import { errorHandler } from "@p40/common/utils/erro-handler";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("churchId");
  try {
    const event = await prisma.event.findFirst({
      where: {
        church: {
          id: id,
        },
      },
      include: {
        church: {
          select: {
            name: true,
            city: true,
            country: true,
          },
        },
      },
    });

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
