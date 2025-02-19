import { NextResponse } from "next/server";
import { errorHandler } from "@p40/common/utils/erro-handler";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { prisma } from "@p40/app/api/prisma";

export async function POST(req: Request) {
  try {
    const { email, imageUrl, name } = await req.json();

    if (!email || !name) {
      throw new FailException({
        message: "Dados inválidos",
        statusCode: 400,
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let user;

    if (!existingUser) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          imageUrl,
          onboarding: false,
        },
      });
    } else if (existingUser.onboarding === false) {
      user = await prisma.user.update({
        where: { email },
        data: {
          name,
          imageUrl,
        },
      });
    } else {
      user = existingUser;
    }

    return NextResponse.json(
      { user, message: "Login bem-sucedido" },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
