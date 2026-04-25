import { NextResponse } from "next/server";
import { errorHandler } from "@p40/common/utils/erro-handler";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { prisma } from "@p40/app/api/prisma";
import { shouldAutoAdmin } from "@p40/common/utils/auto-admin";

export async function POST(req: Request) {
  try {
    const { email: rawEmail, imageUrl, name, zionId } = await req.json();
    const email = rawEmail?.toLowerCase();

    if (!email || !name) {
      throw new FailException({
        message: "Dados inválidos",
        statusCode: 400,
      });
    }

    const role = shouldAutoAdmin(name) ? "ADMIN" : undefined;

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
          churchId: zionId,
          ...(role ? { role } : {}),
        },
      });
    } else if (existingUser.onboarding === false) {
      user = await prisma.user.update({
        where: { email },
        data: {
          name,
          imageUrl,
          churchId: zionId,
          ...(role ? { role } : {}),
        },
      });
    } else {
      if (role && existingUser.role !== role) {
        user = await prisma.user.update({
          where: { email },
          data: {
            role,
          },
        });
      } else {
        user = existingUser;
      }
    }

    return NextResponse.json(
      { user, message: "Login bem-sucedido" },
      { status: 200 },
    );
  } catch (error) {
    return errorHandler(error);
  }
}
