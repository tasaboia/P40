import { NextResponse } from "next/server";
import Log from "@p40/services/logging";
import { prisma } from "../../prisma";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { errorHandler } from "@p40/common/utils/erro-handler";

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      include: {
        churchs: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
    });

    if (!regions || regions.length === 0) {
      throw new FailException({
        message: "Nenhuma região encontrada",
        statusCode: 404,
      });
    }

    const formattedResponse = regions.map((region) => ({
      region: {
        id: region.id,
        name: region.name,
        code: region.code,
      },
      churches: region.churchs.map((church) => ({
        id: church.id,
        name: church.name,
        city: church.city,
        country: church.country,
      })),
    }));

    return NextResponse.json(formattedResponse, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
